package com.vassarlabs.treatment.service.impl;
import com.sendgrid.Response;
import com.vassarlabs.treatment.constants.EmailProviders;
import com.vassarlabs.treatment.pojo.CommResponse;
import com.vassarlabs.treatment.pojo.EmailRequestPojo;
import com.vassarlabs.treatment.pojo.SMSRequest;
import com.vassarlabs.treatment.service.api.ICommunicationService;
import com.vassarlabs.treatment.service.email.SendGridService;
import com.vassarlabs.treatment.sms.SMSFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class CommunicationServiceImpl implements ICommunicationService {

    private final SMSFactory smsFactory;
    private final SendGridService sendGridService;

    @Autowired
    public CommunicationServiceImpl(SMSFactory smsFactory, SendGridService sendGridService) {
        this.smsFactory = smsFactory;
        this.sendGridService = sendGridService;
    }

    @Override
    public CommResponse sendMessage(SMSRequest smsRequest) {
        return smsFactory.getSMSAdaptor(selectSMSProvider()).sentMessage(smsRequest);
    }

    @Override
    public CommResponse sendMessage(SMSRequest smsRequest, String smsProviders) {
        return smsFactory.getSMSAdaptor(smsProviders).sentMessage(smsRequest);
    }

    //@Async
    @Override
    public CommResponse processResponse(String smsResponse, String smsProviders) {
        return smsFactory.getSMSAdaptor(smsProviders).processSMSResponse(smsResponse);
    }

    @Override
    public CommResponse sendEmail(EmailRequestPojo emailRequest) {
        Response response = sendGridService.sendEmail(emailRequest);
        return sendGridService.processEmailResponse(response,emailRequest);
    }

    @Override
    public CommResponse processSendGridResponse(String emailResponse, EmailProviders emailProviders) {
        return sendGridService.processSendGridResponse(emailResponse);
    }

    private String selectSMSProvider(){
        return  "TWILIO";
    }

}
