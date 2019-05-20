#ifndef FP_COMMAND_H
#define FP_COMMAND_H

#if ARDUINO >= 100
#include "Arduino.h"
#else
#include "WProgram.h"
#endif

#include <SoftwareSerial.h>

void FP_OPEN(SoftwareSerial &FP_Serial);
void FP_LED_open(SoftwareSerial &FP_Serial);
void FP_LED_close(SoftwareSerial &FP_Serial);
void FP_GetEnrollCount(SoftwareSerial FP_Serial);
void FP_EnrollStart(int specify_ID, SoftwareSerial &FP_Serial);
void FP_Enroll(int Enroll_define, SoftwareSerial &FP_Serial);
void FP_IsPressFinger(SoftwareSerial &FP_Serial);
void FP_DeleteAll(SoftwareSerial &FP_Serial);
void FP_Identify(SoftwareSerial &FP_Serial);
void FP_CAPTUREFINGER(unsigned long picture_quality, SoftwareSerial &FP_Serial);
short FP_getReturnACK();
bool FP_boolReturnACK();
#endif
