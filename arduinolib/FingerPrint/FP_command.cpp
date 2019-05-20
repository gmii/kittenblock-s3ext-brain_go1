#include <SoftwareSerial.h>
#include "FP_command.h"
#include "FP_definition.h"

//***Fingerprint Protocol***
void SendCommand(unsigned char *ucData,unsigned int length, SoftwareSerial &FP_Serial)
{
   unsigned int i;
   for(i = 0; i < length; i++)
      FP_Serial.write(*(ucData + i));
}

void ReceiveCommand(unsigned char *ucData,unsigned int length, SoftwareSerial &FP_Serial)
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

void send_receive_command(SoftwareSerial &FP_Serial)
{
   SendCommand(&FP_command_package.Head1,COMMAND_PACKAGE_LENGTH, FP_Serial);   //call by address packet and length
   ReceiveCommand(&FP_command_package.Head1,COMMAND_PACKAGE_LENGTH, FP_Serial);

   FP_return_para=FP_command_package.nParam;                  //get final value to result
   FP_return_ack=FP_command_package.wCmd;
}

void FP_OPEN(SoftwareSerial &FP_Serial)
{
  FP_command_package.Head1=COMMAND_START_CODE1;
  FP_command_package.Head2=COMMAND_START_CODE2;
  FP_command_package.wDevId=DEVICE_ID;
  FP_command_package.nParam=0x00000000;    //didn't get information
  FP_command_package.wCmd=OPEN;
  FP_command_package.wChkSum=CalcChkSumOfCmdAckPkt(&FP_command_package);

  send_receive_command(FP_Serial);
}

void FP_LED_open(SoftwareSerial &FP_Serial)
{
  FP_command_package.Head1=COMMAND_START_CODE1;
  FP_command_package.Head2=COMMAND_START_CODE2;
  FP_command_package.wDevId=DEVICE_ID;
  FP_command_package.nParam=0x00000001; //open LED
  FP_command_package.wCmd=CMOSLED;
  FP_command_package.wChkSum=CalcChkSumOfCmdAckPkt(&FP_command_package);

  send_receive_command(FP_Serial);
}

void FP_LED_close(SoftwareSerial &FP_Serial)
{
  FP_command_package.Head1=COMMAND_START_CODE1;
  FP_command_package.Head2=COMMAND_START_CODE2;
  FP_command_package.wDevId=DEVICE_ID;
  FP_command_package.nParam=0x00000000; //close LED
  FP_command_package.wCmd=CMOSLED;
  FP_command_package.wChkSum=CalcChkSumOfCmdAckPkt(&FP_command_package);

  send_receive_command(FP_Serial);
}

void FP_GetEnrollCount(SoftwareSerial &FP_Serial)
{
  FP_command_package.Head1=COMMAND_START_CODE1;
  FP_command_package.Head2=COMMAND_START_CODE2;
  FP_command_package.wDevId=DEVICE_ID;
  FP_command_package.nParam=0x00000000;
  FP_command_package.wCmd=GETENROLLCOUNT;
  FP_command_package.wChkSum=CalcChkSumOfCmdAckPkt(&FP_command_package);

  send_receive_command(FP_Serial);
}

void FP_EnrollStart(int specify_ID, SoftwareSerial &FP_Serial)
{
  FP_command_package.Head1=COMMAND_START_CODE1;
  FP_command_package.Head2=COMMAND_START_CODE2;
  FP_command_package.wDevId=DEVICE_ID;
  FP_command_package.nParam=specify_ID;
  FP_command_package.wCmd=ENROLLSTART;
  FP_command_package.wChkSum=CalcChkSumOfCmdAckPkt(&FP_command_package);

  send_receive_command(FP_Serial);
}

void FP_Enroll(int Enroll_define, SoftwareSerial &FP_Serial)
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
  FP_command_package.Head1=COMMAND_START_CODE1;
  FP_command_package.Head2=COMMAND_START_CODE2;
  FP_command_package.wDevId=DEVICE_ID;
  FP_command_package.nParam=0x00000000;
  FP_command_package.wCmd=Enroll_command;
  FP_command_package.wChkSum=CalcChkSumOfCmdAckPkt(&FP_command_package);

  send_receive_command(FP_Serial);
}

void FP_IsPressFinger(SoftwareSerial &FP_Serial)
{
  FP_command_package.Head1=COMMAND_START_CODE1;
  FP_command_package.Head2=COMMAND_START_CODE2;
  FP_command_package.wDevId=DEVICE_ID;
  FP_command_package.nParam=0x00000000;
  FP_command_package.wCmd=ISPRESSFINGER;
  FP_command_package.wChkSum=CalcChkSumOfCmdAckPkt(&FP_command_package);

  send_receive_command(FP_Serial);
}

void FP_CAPTUREFINGER(unsigned long picture_quality, SoftwareSerial &FP_Serial)  //0:normal picture, 1:best picture
{
  FP_command_package.Head1=COMMAND_START_CODE1;
  FP_command_package.Head2=COMMAND_START_CODE2;
  FP_command_package.wDevId=DEVICE_ID;
  FP_command_package.nParam=picture_quality;
  FP_command_package.wCmd=CAPTURE_FINGER;
  FP_command_package.wChkSum=CalcChkSumOfCmdAckPkt(&FP_command_package);

  send_receive_command(FP_Serial);
}

void FP_DeleteAll(SoftwareSerial &FP_Serial)
{
  FP_command_package.Head1=COMMAND_START_CODE1;
  FP_command_package.Head2=COMMAND_START_CODE2;
  FP_command_package.wDevId=DEVICE_ID;
  FP_command_package.nParam=0x00000000;
  FP_command_package.wCmd=DELETEALL;
  FP_command_package.wChkSum=CalcChkSumOfCmdAckPkt(&FP_command_package);

  send_receive_command(FP_Serial);
}

void FP_Identify(SoftwareSerial &FP_Serial)
{
  FP_command_package.Head1=COMMAND_START_CODE1;
  FP_command_package.Head2=COMMAND_START_CODE2;
  FP_command_package.wDevId=DEVICE_ID;
  FP_command_package.nParam=0x00000000;
  FP_command_package.wCmd=IDENTIFY;
  FP_command_package.wChkSum=CalcChkSumOfCmdAckPkt(&FP_command_package);

  send_receive_command(FP_Serial);
}

short FP_getReturnACK() {
    return FP_return_ack;
}

bool FP_boolReturnACK() {
    return (FP_return_ack == ACK) ? true : false;
}
