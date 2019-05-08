//***Fingerprint Protocol***
void SendCommand(unsigned char *ucData,unsigned int length)
{
   unsigned int i;
   for(i = 0; i < length; i++)
      FP_Serial.write(*(ucData + i));
}

void ReceiveCommand(unsigned char *ucData,unsigned int length)
{
   unsigned int i=0,time_out=0;
   do
    {
     if(FP_Serial.available()>0)  //check RX data
       {
       if(i < length)
           {
           *(ucData + i) = (byte)FP_Serial.read();
           i++;  //write command package from RX
           }
       }
     else
       {
       delay(100);     //Unit:milisecond 
       time_out++;
       if(time_out==5000)  //waiting for image process
         {
          Serial.print("No fingerprint module!\n");
          while(1);  //Pausing threat
         }
       }
    }while(i<length);  //check whether bytes
}

unsigned short CalcChkSumOfCmdAckPkt(COMMAND_PACKAGE_STRUCTURE *pPkt)
{
   unsigned short wChkSum = 0;
   unsigned char *pBuf = (unsigned char*)pPkt;
   int i;
	
   for(i=0;i<(sizeof(COMMAND_PACKAGE_STRUCTURE)-2);i++)
      wChkSum += pBuf[i];

   return wChkSum;
}

void send_receive_command()
{
   SendCommand(&command_package.Head1,COMMAND_PACKAGE_LENGTH);   //call by address packet and length
   ReceiveCommand(&command_package.Head1,COMMAND_PACKAGE_LENGTH);  
  
   return_para=command_package.nParam;                  //get final value to result
   return_ack=command_package.wCmd;
}

void FP_OPEN()
{
  command_package.Head1=COMMAND_START_CODE1;  
  command_package.Head2=COMMAND_START_CODE2;
  command_package.wDevId=DEVICE_ID;
  command_package.nParam=0x00000000;    //didn't get information
  command_package.wCmd=OPEN;
  command_package.wChkSum=CalcChkSumOfCmdAckPkt(&command_package);
  
  send_receive_command();
}

void FP_LED_open()
{
  command_package.Head1=COMMAND_START_CODE1;  
  command_package.Head2=COMMAND_START_CODE2;
  command_package.wDevId=DEVICE_ID;
  command_package.nParam=0x00000001; //open LED
  command_package.wCmd=CMOSLED;
  command_package.wChkSum=CalcChkSumOfCmdAckPkt(&command_package);
  
  send_receive_command();
}

void FP_LED_close()
{
  command_package.Head1=COMMAND_START_CODE1;  
  command_package.Head2=COMMAND_START_CODE2;
  command_package.wDevId=DEVICE_ID;
  command_package.nParam=0x00000000; //close LED
  command_package.wCmd=CMOSLED;
  command_package.wChkSum=CalcChkSumOfCmdAckPkt(&command_package);
  
  send_receive_command();
}

void FP_GetEnrollCount()
{
  command_package.Head1=COMMAND_START_CODE1;  
  command_package.Head2=COMMAND_START_CODE2;
  command_package.wDevId=DEVICE_ID;
  command_package.nParam=0x00000000; 
  command_package.wCmd=GETENROLLCOUNT;
  command_package.wChkSum=CalcChkSumOfCmdAckPkt(&command_package);
  
  send_receive_command();
}

void FP_EnrollStart(int specify_ID)
{
  command_package.Head1=COMMAND_START_CODE1;  
  command_package.Head2=COMMAND_START_CODE2;
  command_package.wDevId=DEVICE_ID;
  command_package.nParam=specify_ID; 
  command_package.wCmd=ENROLLSTART;
  command_package.wChkSum=CalcChkSumOfCmdAckPkt(&command_package);
  
  send_receive_command(); 
}  

void FP_Enroll(int Enroll_define)
{
  unsigned short Enroll_command;
  
  switch(Enroll_define)
    {
      case 1:
             Enroll_command=ENROLL1;
             break;
      case 2:
             Enroll_command=ENROLL2;
             break;
      case 3:
             Enroll_command=ENROLL3;
             break;      
    }
  command_package.Head1=COMMAND_START_CODE1;  
  command_package.Head2=COMMAND_START_CODE2;
  command_package.wDevId=DEVICE_ID;
  command_package.nParam=0x00000000;
  command_package.wCmd=Enroll_command;
  command_package.wChkSum=CalcChkSumOfCmdAckPkt(&command_package);
  
  send_receive_command(); 
}

void FP_IsPressFinger()
{
  command_package.Head1=COMMAND_START_CODE1;  
  command_package.Head2=COMMAND_START_CODE2;
  command_package.wDevId=DEVICE_ID;
  command_package.nParam=0x00000000; 
  command_package.wCmd=ISPRESSFINGER;
  command_package.wChkSum=CalcChkSumOfCmdAckPkt(&command_package);
  
  send_receive_command();  
} 

void FP_CAPTUREFINGER(unsigned long picture_quality)  //0:normal picture, 1:best picture
{
  command_package.Head1=COMMAND_START_CODE1;  
  command_package.Head2=COMMAND_START_CODE2;
  command_package.wDevId=DEVICE_ID;
  command_package.nParam=picture_quality; 
  command_package.wCmd=CAPTURE_FINGER;
  command_package.wChkSum=CalcChkSumOfCmdAckPkt(&command_package);
  
  send_receive_command();  
}

void FP_DeleteAll()
{
  command_package.Head1=COMMAND_START_CODE1;  
  command_package.Head2=COMMAND_START_CODE2;
  command_package.wDevId=DEVICE_ID;
  command_package.nParam=0x00000000; 
  command_package.wCmd=DELETEALL;
  command_package.wChkSum=CalcChkSumOfCmdAckPkt(&command_package);
  
  send_receive_command();
}

void FP_Identify()
{
  command_package.Head1=COMMAND_START_CODE1;  
  command_package.Head2=COMMAND_START_CODE2;
  command_package.wDevId=DEVICE_ID;
  command_package.nParam=0x00000000; 
  command_package.wCmd=IDENTIFY;
  command_package.wChkSum=CalcChkSumOfCmdAckPkt(&command_package);
  
  send_receive_command();
}
