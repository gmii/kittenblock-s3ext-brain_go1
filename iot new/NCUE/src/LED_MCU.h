#ifndef HT45_LED_MCU_H
#define HT45_LED_MCU_H

class HT45_LED_MCU
{
public:
    void HT45_LED_Decode(unsigned char R, unsigned char G, unsigned char B);
    void HT45_Breath_adjust(unsigned char UpDown, unsigned char R_Index, unsigned char G_Index, unsigned char B_Index);
    void HT45_breath(unsigned char R, unsigned char G, unsigned char B, unsigned char Speed);

protected:
    volatile unsigned char LED_MCU_DataPin = 3;
    volatile unsigned char LED_MCU_Red, LED_MCU_Green, LED_MCU_Blue;
    volatile unsigned char _Breath_Index = 0;
private:
    typedef struct {
      unsigned char bit0 : 1;
      unsigned char bit1 : 1;
      unsigned char bit2 : 1;
      unsigned char bit3 : 1;
      unsigned char bit4 : 1;
      unsigned char bit5 : 1;
      unsigned char bit6 : 1;
      unsigned char bit7 : 1;
    } HT45_bit_type;

    typedef union {
      HT45_bit_type bit_var;
      unsigned char byte_var;
    } HT45_UN;

    HT45_bit_type HT45_Breath_Var;
    volatile HT45_UN HT45_R_Data;
    volatile HT45_UN HT45_G_Data;
    volatile HT45_UN HT45_B_Data;
};
#endif // HT45_LED_MCU_H
