# Daily Outreach Log Validation Setup Guide

This guide provides multiple options for automating daily outreach log validation.

## 🎯 Quick Start (Cron Job - Recommended)

### 1. Make scripts executable
```bash
chmod +x src/scripts/daily-outreach-validation.sh
chmod +x src/scripts/test-latest-outreach-log.ts
```

### 2. Test the script manually
```bash
./src/scripts/daily-outreach-validation.sh
```

### 3. Add to cron
```bash
crontab -e
```

Add this line (runs daily at 6 PM):
```bash
0 18 * * * cd /Users/asliates/Desktop/KredosAI/testing-feature-test_automation_scripts/KredosApplication/automation && ./src/scripts/daily-outreach-validation.sh
```

### 4. Configure notifications (Optional)
Edit `src/scripts/daily-outreach-validation.sh`:
```bash
EMAIL_RECIPIENT="your-email@company.com"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
```

---

## 🔄 Option 2: GitHub Actions (Cloud-based)

### Setup Steps:

1. **Add secrets to GitHub repository:**
   - Go to repository Settings → Secrets and variables → Actions
   - Add these secrets:
     ```
     AWS_ACCESS_KEY_ID=your_access_key
     AWS_SECRET_ACCESS_KEY=your_secret_key
     AWS_SESSION_TOKEN=your_session_token (if using temporary credentials)
     SLACK_WEBHOOK=your_slack_webhook_url
     EMAIL_USERNAME=your_smtp_username
     EMAIL_PASSWORD=your_smtp_password
     ```

2. **Customize workflow:**
   - Edit `.github/workflows/daily-outreach-validation.yml`
   - Update email addresses, Slack channels, timezone
   - Adjust cron schedule if needed

3. **Enable GitHub Actions:**
   - Go to repository Actions tab
   - Enable workflows if not already enabled

### Features:
- ✅ Runs automatically every day
- ✅ Sends email/Slack notifications on failure
- ✅ Creates GitHub issues for critical problems
- ✅ Stores validation reports as artifacts
- ✅ No local machine dependencies

---

## 🖥️ Option 3: AWS Lambda (Serverless)

### Create Lambda Function:

```javascript
// lambda-outreach-validation.js
const { execSync } = require('child_process');
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    try {
        // Clone repository and run validation
        execSync('git clone https://github.com/your-org/your-repo.git /tmp/validation');
        process.chdir('/tmp/validation');
        execSync('npm install');
        
        const result = execSync('npx ts-node src/scripts/test-latest-outreach-log.ts', 
                               { encoding: 'utf8' });
        
        console.log('Validation completed successfully');
        return { statusCode: 200, body: 'Success' };
        
    } catch (error) {
        console.error('Validation failed:', error.message);
        
        // Send SNS notification
        const sns = new AWS.SNS();
        await sns.publish({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Subject: 'Outreach Log Validation Failed',
            Message: error.message
        }).promise();
        
        throw error;
    }
};
```

### Setup EventBridge Rule:
```bash
aws events put-rule \
    --name daily-outreach-validation \
    --schedule-expression "cron(0 18 * * ? *)"

aws events put-targets \
    --rule daily-outreach-validation \
    --targets "Id"="1","Arn"="arn:aws:lambda:region:account:function:outreach-validation"
```

---

## 🐳 Option 4: Docker + Cron

### Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Install cron
RUN apk add --no-cache dcron

# Add cron job
RUN echo "0 18 * * * cd /app && npx ts-node src/scripts/test-latest-outreach-log.ts >> /var/log/validation.log 2>&1" | crontab -

CMD ["crond", "-f", "-d", "8"]
```

### Run container:
```bash
docker build -t outreach-validator .
docker run -d \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e AWS_SESSION_TOKEN=your_token \
  -v $(pwd)/logs:/var/log \
  outreach-validator
```

---

## 📊 Monitoring & Alerting

### Log Locations:
- **Cron Job:** `/tmp/outreach-validation-YYYYMMDD.log`
- **GitHub Actions:** Actions tab → Artifacts
- **Lambda:** CloudWatch Logs

### Alert Conditions:
- ❌ Missing required headers
- ❌ Line ending format issues
- ❌ Invalid data formats
- ❌ File structure problems

### Sample Alert Rules:
```bash
# Monitor log for critical issues
tail -f /tmp/outreach-validation-*.log | grep -E "❌|CRITICAL|ERROR" | \
while read line; do
    echo "ALERT: $line" | mail -s "Outreach Validation Alert" admin@company.com
done
```

---

## 🔧 Customization Options

### Change Validation Schedule:
```bash
# Every hour: 0 * * * *
# Every 6 hours: 0 */6 * * *
# Weekdays only: 0 18 * * 1-5
# Multiple times: 0 9,18 * * *
```

### Add Custom Validations:
Edit `src/scripts/test-latest-outreach-log.ts` and add new checks:
```typescript
// Custom business rule validation
if (someCustomCondition) {
    result.errors.push('Custom validation failed');
}
```

### Integration with Monitoring Tools:
- **Grafana:** Parse logs and create dashboards
- **Datadog:** Send metrics via API
- **PagerDuty:** Trigger incidents on critical failures

---

## 🚀 Quick Commands

### Manual run:
```bash
npx ts-node src/scripts/test-latest-outreach-log.ts
```

### Check cron status:
```bash
crontab -l                    # List cron jobs
tail -f /var/log/cron.log     # Monitor cron execution
```

### Test notifications:
```bash
./src/scripts/daily-outreach-validation.sh
```

### View recent logs:
```bash
ls -la /tmp/outreach-validation-*.log
tail -100 /tmp/outreach-validation-$(date +%Y%m%d).log
```

---

## ⚠️ Troubleshooting

### Common Issues:

1. **AWS Credentials Expired:**
   ```bash
   aws sts get-caller-identity  # Check if credentials work
   ```

2. **Permission Denied:**
   ```bash
   chmod +x src/scripts/*.sh
   ```

3. **Node.js Path Issues:**
   ```bash
   which node
   which npx
   # Add to crontab if needed: PATH=/usr/local/bin:$PATH
   ```

4. **Email Not Sending:**
   ```bash
   echo "test" | mail -s "test" your-email@company.com
   ```

---

## 📈 Success Metrics

Track these metrics to ensure validation is working:
- ✅ Daily execution success rate
- ✅ Average validation completion time
- ✅ Number of critical issues detected
- ✅ Time to issue resolution
- ✅ Notification delivery success

---

**Choose the option that best fits your infrastructure and requirements!** 