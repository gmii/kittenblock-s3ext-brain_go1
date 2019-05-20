#ifndef FP_DEFINITION_H
#define FP_DEFINITION_H

//Command and data package definition
#define COMMAND_PACKAGE_LENGTH 12
#define COMMAND_START_CODE1  0x55
#define COMMAND_START_CODE2  0xAA

#define DEVICE_ID            0x0001

#define OPEN                 0x01
#define CMOSLED              0x12
#define GETENROLLCOUNT       0x20
#define ENROLLSTART          0x22
#define ENROLL1              0x23
#define ENROLL2              0x24
#define ENROLL3              0x25
#define ISPRESSFINGER        0x26
#define DELETEALL            0x41
#define IDENTIFY             0x51
#define CAPTURE_FINGER       0x60
#define GETTEMPLATE          0x70
#define SETTEMPLATE          0x71
#define ACK                  0x30
#define NACK                 0x31

typedef struct {
  unsigned char Head1;
  unsigned char Head2;
  unsigned short wDevId;
  unsigned long nParam;
  unsigned short wCmd;
  unsigned short wChkSum;
} COMMAND_PACKAGE_STRUCTURE;

COMMAND_PACKAGE_STRUCTURE FP_command_package;  //inherit structure data type

unsigned long FP_return_para;    //parameter value for each command
unsigned short FP_return_ack;    //acknowledge status for each command
#endif
