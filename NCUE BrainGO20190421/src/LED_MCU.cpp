#if (ARDUINO < 100)
#include <WProgram.h>
#else
#include <Arduino.h>
#endif

#include "LED_MCU.h"

#define __Cascade_All__ 8

#define HT45_Breath_ColorChange_flag HT45_Breath_Var.bit0
#define HT45_PatternChangeFlag HT45_Breath_Var.bit1
#define HT45_Breath_UpDown_flag HT45_Breath_Var.bit2

#define  HT45_red_1bit  HT45_R_Data.bit_var.bit0
#define  HT45_red_2bit  HT45_R_Data.bit_var.bit1
#define  HT45_red_3bit  HT45_R_Data.bit_var.bit2
#define  HT45_red_4bit  HT45_R_Data.bit_var.bit3
#define  HT45_red_5bit  HT45_R_Data.bit_var.bit4
#define  HT45_red_6bit  HT45_R_Data.bit_var.bit5
#define  HT45_red_7bit  HT45_R_Data.bit_var.bit6
#define  HT45_red_8bit  HT45_R_Data.bit_var.bit7

#define  HT45_green_1bit  HT45_G_Data.bit_var.bit0
#define  HT45_green_2bit  HT45_G_Data.bit_var.bit1
#define  HT45_green_3bit  HT45_G_Data.bit_var.bit2
#define  HT45_green_4bit  HT45_G_Data.bit_var.bit3
#define  HT45_green_5bit  HT45_G_Data.bit_var.bit4
#define  HT45_green_6bit  HT45_G_Data.bit_var.bit5
#define  HT45_green_7bit  HT45_G_Data.bit_var.bit6
#define  HT45_green_8bit  HT45_G_Data.bit_var.bit7

#define  HT45_blue_1bit  HT45_B_Data.bit_var.bit0
#define  HT45_blue_2bit  HT45_B_Data.bit_var.bit1
#define  HT45_blue_3bit  HT45_B_Data.bit_var.bit2
#define  HT45_blue_4bit  HT45_B_Data.bit_var.bit3
#define  HT45_blue_5bit  HT45_B_Data.bit_var.bit4
#define  HT45_blue_6bit  HT45_B_Data.bit_var.bit5
#define  HT45_blue_7bit  HT45_B_Data.bit_var.bit6
#define  HT45_blue_8bit  HT45_B_Data.bit_var.bit7

void HT45_LED_MCU::HT45_LED_Decode(unsigned char R, unsigned char G, unsigned char B) { //1
  unsigned char i = 0;//2
  unsigned char Data_temp = 0;//3
  noInterrupts();//4
  for (i = 0; i < 8; i++) { //5
    Data_temp = B & 0x80;//6
    digitalWrite(LED_MCU_DataPin, HIGH); //7
    if (Data_temp != 0x80) //8
      digitalWrite(LED_MCU_DataPin, LOW); //9
    else//10
      digitalWrite(LED_MCU_DataPin, HIGH); //11
    B = B << 1; //12
    digitalWrite(LED_MCU_DataPin, LOW); //13
  }//14
  for (i = 0; i < 8; i++) { //15
    Data_temp = R & 0x80;//16
    digitalWrite(LED_MCU_DataPin, HIGH); //17
    if (Data_temp != 0x80) //18
      digitalWrite(LED_MCU_DataPin, LOW); //19
    else//20
      digitalWrite(LED_MCU_DataPin, HIGH); //21
    R = R << 1; //22
    digitalWrite(LED_MCU_DataPin, LOW); //23
  }//24
  for (i = 0; i < 8; i++) { //25
    Data_temp = G & 0x80;//26
    digitalWrite(LED_MCU_DataPin, HIGH); //27
    if (Data_temp != 0x80) //28
      digitalWrite(LED_MCU_DataPin, LOW); //29
    else//30
      digitalWrite(LED_MCU_DataPin, HIGH); //31
    G = G << 1; //32
    digitalWrite(LED_MCU_DataPin, LOW); //33
  }//34
  interrupts();//35
}
void HT45_LED_MCU::HT45_Breath_adjust(unsigned char UpDown, unsigned char R_Index, unsigned char G_Index, unsigned char B_Index) { //ba1
  unsigned char i = 0, j; //ba2
  if (UpDown == 1) { //up//ba3
    LED_MCU_Red +=  R_Index;//ba4
    LED_MCU_Green += G_Index;//ba5
    LED_MCU_Blue += B_Index; //ba6
  }//ba7
  else if (UpDown == 0) { //down//ba8
    LED_MCU_Red -=  R_Index;//ba9
    LED_MCU_Green -= G_Index;//ba10
    LED_MCU_Blue -= B_Index;  //ba11
  }//ba12
  if (_Breath_Index == 0) { //ba13
    for (j = 0; j < __Cascade_All__; j++) { //ba14
      for (i = 0; i < 9; i++) { //ba15
        HT45_LED_Decode(LED_MCU_Red, LED_MCU_Green, LED_MCU_Blue); //ba16
      }//ba17
    }//ba18
  }//ba19
  _Breath_Index++;//ba20
  if (_Breath_Index > 2) { //adjust berath step//ba21
    _Breath_Index = 0; //ba22
  }//ba23
}
void HT45_LED_MCU::HT45_breath(unsigned char R, unsigned char G, unsigned char B, unsigned char Speed) { //b1
  unsigned char i, j; //b2
  unsigned char i1, i2, i3, i4, i5, i6, i7, i8; //b3
  HT45_Breath_UpDown_flag = 1;//b4
  HT45_R_Data.byte_var = R;//b5
  HT45_G_Data.byte_var = G;//b6
  HT45_B_Data.byte_var = B;//b7
  for (i = 0; i < (Speed << 1); i++)  { //b8
    delay(8);//b9
  }//b10
  LED_MCU_Red = 0;//b11
  LED_MCU_Green = 0;//b12
  LED_MCU_Blue = 0; //b13
  for (j = 0; j < 2; j++) { //b14
    for (i1 = 0; i1 < 1; i1++) { //b15
      for (i2 = 0; i2 < 2; i2++) { //b16
        for (i3 = 0; i3 < 2; i3++) { //b17
          for (i4 = 0; i4 < 2; i4++) { //b18
            for (i5 = 0; i5 < 2; i5++) { //b19
              for (i6 = 0; i6 < 2; i6++) { //b20
                for (i7 = 0; i7 < 2; i7++) { //b21
                  for (i8 = 0; i8 < 2; i8++) { //b22
                    if (HT45_PatternChangeFlag == 1) { //b23
                      i1 = 2;//b24
                      i2 = 2;//b25
                      i3 = 2;//b26
                      i4 = 2;//b27
                      i5 = 2;//b28
                      i6 = 2;//b29
                      i7 = 2;//b30
                      i8 = 2;//b31
                      break;  //b32
                    }//b33
                    HT45_Breath_adjust(HT45_Breath_UpDown_flag, HT45_red_8bit, HT45_green_8bit, HT45_blue_8bit); //b34
                    if (HT45_Breath_UpDown_flag == 1) //b35
                      delay(Speed + 4); //b36
                    else//b37
                      delay(Speed + 1); //b38
                  }  //b39
                  HT45_Breath_adjust(HT45_Breath_UpDown_flag, HT45_red_7bit, HT45_green_7bit, HT45_blue_7bit); //b40
                  if (HT45_Breath_UpDown_flag == 1) //b41
                    delay(Speed + 3); //b42
                  else//b43
                    delay(Speed + 1); //b44
                }//b45
                HT45_Breath_adjust(HT45_Breath_UpDown_flag, HT45_red_6bit, HT45_green_6bit, HT45_blue_6bit); //b46
                if (HT45_Breath_UpDown_flag == 1) //b47
                  delay(Speed + 2); //b48
                else//b49
                  delay(Speed + 1); //b50
              }//b51
              HT45_Breath_adjust(HT45_Breath_UpDown_flag, HT45_red_5bit, HT45_green_5bit, HT45_blue_5bit); //b52
              if (HT45_Breath_UpDown_flag == 1) //b53
                delay(Speed + 1); //b54
              else//b55
                delay(Speed + 1); //b56
            }//b57
            HT45_Breath_adjust(HT45_Breath_UpDown_flag, HT45_red_4bit, HT45_green_4bit, HT45_blue_4bit); //b58
            if (HT45_Breath_UpDown_flag == 1) //b59
              delay(Speed + 1); //b60
            else//b61
              delay(Speed + 2); //b62
          }//b63
          HT45_Breath_adjust(HT45_Breath_UpDown_flag, HT45_red_3bit, HT45_green_3bit, HT45_blue_3bit); //b64
          if (HT45_Breath_UpDown_flag == 1) //b65
            delay(Speed + 1); //b66
          else//b67
            delay(Speed + 2); //b68
        }//b69
        HT45_Breath_adjust(HT45_Breath_UpDown_flag, HT45_red_2bit, HT45_green_2bit, HT45_blue_2bit); //b70
        if (HT45_Breath_UpDown_flag == 1) //b71
          delay(Speed);//b72
        else//b73
          delay(Speed + 2); //b74
      }//b75
      HT45_Breath_adjust(HT45_Breath_UpDown_flag, HT45_red_1bit, HT45_green_1bit, HT45_blue_1bit); //b76
      if (HT45_Breath_UpDown_flag == 1) //b77
        delay(Speed);//b78
      else//b79
        delay(Speed + 3); //b80
    }//b81
    HT45_Breath_UpDown_flag++;//b82
  }//b83
}
