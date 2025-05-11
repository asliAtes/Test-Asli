import os
import csv
import boto3
import pymysql
import logging
from datetime import datetime, timedelta
from botocore.exceptions import ClientError

# --- Configuration Section ---

# MySQL connection details
DB_HOST = 'kredos-dev-mysql.cluster-c70f5cj9qhpu.us-east-2.rds.amazonaws.com'
DB_USER = 'root'
DB_PASSWORD = 'xBk6sStw*rZv'
DB_NAME = 'kreedos'
TABLE_NAME = 'run'
ARCHIVE_TABLE_NAME = 'run_archive'  # Optional recovery table

# AWS S3 details
S3_BUCKET = 'kredos-uscellular-staging'
S3_FOLDER = 'kredos-uscellular-staging/run_table_data_archives/'

# Local temporary CSV file directory
EXPORT_DIR = '/tmp'

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- Script Begins ---

def get_db_connection():
    """Establish MySQL connection."""
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )

def fetch_old_records(connection, cutoff_timestamp_ms):
    """Fetch records older than cutoff from 'run' table."""
    with connection.cursor() as cursor:
        query = f"""
            SELECT * FROM {TABLE_NAME}
            WHERE msg_sent_date < %s
        """
        logger.info(f"Executing query: {query.strip()} with cutoff_timestamp_ms={cutoff_timestamp_ms}")
        cursor.execute(query, (cutoff_timestamp_ms,))
        return cursor.fetchall()

def export_to_csv(records, export_path):
    """Export list of records to CSV."""
    if not records:
        logger.info("No records to export.")
        return False

    with open(export_path, mode='w', newline='') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=records[0].keys())
        writer.writeheader()
        writer.writerows(records)

    logger.info(f"Exported {len(records)} records to CSV: {export_path}")
    return True

def upload_to_s3(file_path, s3_bucket, s3_key):
    """Upload file to S3."""
    s3 = boto3.client('s3')
    try:
        s3.upload_file(file_path, s3_bucket, s3_key)
        logger.info(f"Successfully uploaded {file_path} to s3://{s3_bucket}/{s3_key}")
        return True
    except ClientError as e:
        logger.error(f"S3 upload failed: {e}")
        return False

def archive_records(connection, records):
    """Optional: Insert old records into archive table for temporary backup."""
    if not records:
        return

    with connection.cursor() as cursor:
        fields = records[0].keys()
        placeholders = ', '.join(['%s'] * len(fields))
        columns = ', '.join(fields)

        query = f"""
            INSERT INTO {ARCHIVE_TABLE_NAME} ({columns})
            VALUES ({placeholders})
        """

        data = [tuple(record.values()) for record in records]
        cursor.executemany(query, data)
    connection.commit()
    logger.info(f"Archived {len(records)} records to {ARCHIVE_TABLE_NAME} table.")

def delete_old_records(connection, record_ids):
    """Delete old records from 'run' table."""
    if not record_ids:
        return

    with connection.cursor() as cursor:
        placeholders = ','.join(['%s'] * len(record_ids))
        query = f"DELETE FROM {TABLE_NAME} WHERE run_id IN ({placeholders})"
        cursor.execute(query, record_ids)
    connection.commit()
    logger.info(f"Deleted {len(record_ids)} records from {TABLE_NAME} table.")

def main():
    today = datetime.now().date()
    cutoff_date = today - timedelta(days=60)
    cutoff_timestamp_ms = int(datetime.combine(cutoff_date, datetime.min.time()).timestamp() * 1000)

    export_filename = f"run_archive_{today.strftime('%Y%m%d')}.csv"
    export_path = os.path.join(EXPORT_DIR, export_filename)
    s3_key = f"{S3_FOLDER}{export_filename}"

    logger.info(f"Archival started for records older than {cutoff_date} (timestamp {cutoff_timestamp_ms})")

    try:
        # Step 1: Connect to DB
        connection = get_db_connection()

        # Step 2: Fetch records
        records = fetch_old_records(connection, cutoff_timestamp_ms)

        if not records:
            logger.info("No old records found. Exiting.")
            return

        # Step 3: Export to CSV
        if not export_to_csv(records, export_path):
            logger.error("CSV export failed. Exiting.")
            return

        # Step 4: Upload CSV to S3
        if not upload_to_s3(export_path, S3_BUCKET, s3_key):
            logger.error("S3 upload failed. Exiting.")
            return

        # Step 5 (Optional): Archive records
        #archive_records(connection, records)

        # Step 6: Delete records
        record_ids = [record['run_id'] for record in records]
        delete_old_records(connection, record_ids)

    except Exception as e:
        logger.exception(f"Script failed with error: {e}")
    finally:
        try:
            connection.close()
        except:
            pass

        if os.path.exists(export_path):
            os.remove(export_path)
            logger.info(f"Cleaned up local CSV: {export_path}")

    logger.info("Archival process completed successfully.")

if __name__ == '__main__':
    main()
