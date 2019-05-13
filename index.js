/**
 * Created by STLeee on 2019/5/8.
 */

const ArgumentType = Scratch.ArgumentType;
const BlockType = Scratch.BlockType;
const formatMessage = Scratch.formatMessage;
const log = Scratch.log;

class BrainGOExtension{
    constructor (runtime){
        this.runtime = runtime;
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension('BrainGO', this);
        // session callbacks
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);

        this.decoder = new TextDecoder();
        this.lineBuffer = '';
    }

    write (data){
        if (this.session) this.session.write(data);
    }

    report (data){
        return new Promise(resolve => {
            this.write(data);
            this.reporter = resolve;
        });
    }

    onmessage (data){
        const dataStr = this.decoder.decode(data);
        this.lineBuffer += dataStr;
        if (this.lineBuffer.indexOf('\n') !== -1){
            const lines = this.lineBuffer.split('\n');
            this.lineBuffer = lines.pop();
            for (const l of lines){
                if (this.reporter) this.reporter(l);
            }
        }
    }

    onclose (error){
        log.warn('on close', error);
        this.session = null;
        this.runtime.emit(this.runtime.constructor.PERIPHERAL_ERROR);
    }

    // method required by vm runtime
    scan (){
        this.comm.getDeviceList().then(result => {
            this.runtime.emit(this.runtime.constructor.PERIPHERAL_LIST_UPDATE, result);
        });
    }

    connect (id){
        this.comm.connect(id).then(sess => {
            this.session = sess;
            this.session.onmessage = this.onmessage;
            this.session.onclose = this.onclose;
            // notify gui connected
            this.runtime.emit(this.runtime.constructor.PERIPHERAL_CONNECTED);

            window.kblock.tx = 'hex';
            window.kblock.rx = 'hex';
        }).catch(err => {
            log.warn('connect peripheral fail', err);
        });
    }

    disconnect (){
        this.session.close();
    }

    isConnected (){
        return Boolean(this.session);
    }

    getInfo (){
        return {
            id: 'BrainGO',
            color1: '#0FCAD8',
            color2: '#0A8698',
            color3: '#0A8698',
            showStatusButton: true,

            name: formatMessage({
                id: 'BrainGO.name',
                default: 'BrainGO'
            }),

            blocks: [
                { //setMotor
                    opcode: 'setMotor',
                    blockType: BlockType.COMMAND,

                    text: formatMessage({
                        id: 'BrainGO.setMotor',
                        default: 'set motor [PORT] speed [VALUE]'
                    }),
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'motorWhite',
                            menu: 'motorPort'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    },
                    func: 'setMotor',
                    gen: {
                        arduino: this.setMotorArduino
                    }
                },
                { //setServo
                    opcode: 'setServo',
                    blockType: BlockType.COMMAND,

                    text: formatMessage({
                        id: 'BrainGO.setServo',
                        default: 'set servo [PORT] angle [VALUE]'
                    }),
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'servoGreen',
                            menu: 'servoPort'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        }
                    },
                    func: 'setServo',
                    gen: {
                        arduino: this.setServoArduino
                    }
                },
                { //setBuzzer
                    opcode: 'setBuzzer',
                    blockType: BlockType.COMMAND,

                    text: formatMessage({
                        id: 'BrainGO.setBuzzer',
                        default: 'play tone on note [NOTE] beat [BEAT]'
                    }),
                    arguments: {
                        NOTE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'C4',
                            menu: 'buzzerNote'
                        },
                        BEAT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'half',
                            menu: 'buzzerBeat'
                        }
                    },
                    func: 'setBuzzer',
                    gen: {
                        arduino: this.setBuzzerArduino
                    }
                },
                { //setLED
                    opcode: 'setLED',
                    blockType: BlockType.COMMAND,

                    text: formatMessage({
                        id: 'BrainGO.setLED',
                        default: 'set led [COLOR] [SWITCH]'
                    }),
                    arguments: {
                        COLOR: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ledRed',
                            menu: 'ledColor'
                        },
                        SWITCH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ledOn',
                            menu: 'ledSwitch'
                        }
                    },
                    func: 'setLED',
                    gen: {
                        arduino: this.setLEDArduino
                    }
                },
                { //setLight
                    opcode: 'setLight',
                    blockType: BlockType.COMMAND,

                    text: formatMessage({
                        id: 'BrainGO.setLight',
                        default: 'set light [COLOR] [SWITCH]'
                    }),
                    arguments: {
                        COLOR: {
                            type: ArgumentType.STRING,
                            defaultValue: 'lightRed',
                            menu: 'lightColor'
                        },
                        SWITCH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'lightOn',
                            menu: 'lightSwitch'
                        }
                    },
                    func: 'setLight',
                    gen: {
                        arduino: this.setLightArduino
                    }
                },
                { //setPin
                    opcode: 'setPin',
                    blockType: BlockType.COMMAND,

                    text: formatMessage({
                        id: 'BrainGO.setPin',
                        default: 'set pin [PIN] [SWITCH]'
                    }),
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            defaultValue: 'PC1',
                            menu: 'pinPC'
                        },
                        SWITCH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'pinOn',
                            menu: 'pinSwitch'
                        }
                    },
                    func: 'setPin',
                    gen: {
                        arduino: this.setPinArduino
                    }
                },
                { //getDigitalPin
                    opcode: 'getDigitalPin',
                    blockType: BlockType.REPORTER,

                    text: formatMessage({
                        id: 'BrainGO.getDigitalPin',
                        default: 'read digital pin [PIN]'
                    }),
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 24
                        }
                    },
                    func: 'getDigitalPin',
                    gen: {
                        arduino: this.getDigitalPinArduino
                    }
                },
                { //getAnalogPin
                    opcode: 'getAnalogPin',
                    blockType: BlockType.REPORTER,

                    text: formatMessage({
                        id: 'BrainGO.getAnalogPin',
                        default: 'read analog pin [PIN]'
                    }),
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            defaultValue: "analogPin1",
                            menu: 'analogPin'
                        }
                    },
                    func: 'getAnalogPin',
                    gen: {
                        arduino: this.getAnalogPinArduino
                    }
                },
                { //getTemperatureSensor
                    opcode: 'getTemperatureSensor',
                    blockType: BlockType.REPORTER,

                    text: formatMessage({
                        id: 'BrainGO.getTemperatureSensor',
                        default: 'temperature (°C)'
                    }),
                    arguments: {},
                    func: 'getTemperatureSensor',
                    gen: {
                        arduino: this.getTemperatureSensorArduino
                    }
                },
                { //getLightSensor
                    opcode: 'getLightSensor',
                    blockType: BlockType.REPORTER,

                    text: formatMessage({
                        id: 'BrainGO.getLightSensor',
                        default: 'light sensor [PORT]'
                    }),
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'lightSensorRed',
                            menu: 'lightSensorPort'
                        }
                    },
                    func: 'getLightSensor',
                    gen: {
                        arduino: this.getLightSensorArduino
                    }
                },
                { //getUltrasonicSensor
                    opcode: 'getUltrasonicSensor',
                    blockType: BlockType.REPORTER,

                    text: formatMessage({
                        id: 'BrainGO.getUltrasonicSensor',
                        default: 'ultrasonic sensor [PORT] distance'
                    }),
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ultrasonicSensorWhite',
                            menu: 'ultrasonicSensorPort'
                        }
                    },
                    func: 'getUltrasonicSensor',
                    gen: {
                        arduino: this.getUltrasonicSensorArduino
                    }
                },
                { //get3AxisGyro
                    opcode: 'get3AxisGyro',
                    blockType: BlockType.REPORTER,

                    text: formatMessage({
                        id: 'BrainGO.get3AxisGyro',
                        default: '3-axis gyro [AXIS] angle'
                    }),
                    arguments: {
                        AXIS: {
                            type: ArgumentType.STRING,
                            defaultValue: '3AxisGyroXAxis',
                            menu: '3AxisGyroAxis'
                        }
                    },
                    func: 'get3AxisGyro',
                    gen: {
                        arduino: this.get3AxisGyroArduino
                    }
                }
            ],
            
            menus: {
                'motorPort': ['motorWhite', 'motorBlue'],
                'servoPort': ['servoGreen', 'servoRed'],
                'buzzerNote': [
                    // 'B0', 
                    // 'C1', 'D1', 'E1', 'F1', 'G1', 'A1', 'B1',
                    'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2',
                    'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
                    'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
                    'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5',
                    'C6', 'D6', 'E6', 'F6', 'G6', 'A6', 'B6',
                    'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',
                    'C8', 'D8'],
                'buzzerBeat': ['half', 'quarter', 'eighth', 'whole', 'double'],
                'ledColor': ['ledRed', 'ledYellow', 'ledGreen'],
                'ledSwitch': ['ledOn', 'ledOff'],
                'lightColor': ['lightRed', 'lightBlue', 'lightGreen'],
                'lightSwitch': ['lightOn', 'lightOff'],
                'pinPC': ['PC1', 'PC2', 'PC3', 'PC4', 'PC5'],
                'pinSwitch': ['pinOn', 'pinOff'],
                'analogPin': ['analogPin1', 'analogPin2'],
                'lightSensorPort': ['lightSensorRed', 'lightSensorGreen'],
                'ultrasonicSensorPort': ['ultrasonicSensorWhite', 'ultrasonicSensorBlue'],
                '3AxisGyroAxis': ['3AxisGyroXAxis', '3AxisGyroYAxis', '3AxisGyroZAxis']
            },

            translation_map: {
                'en': {
                    'name': 'BrainGO',
                    'setMotor': 'set motor [PORT] speed (-255~255) [VALUE]',
                    'setServo': 'set servo [PORT] angle (0~180) [VALUE]',
                    'setBuzzer': 'play tone on note [NOTE] beat [BEAT]',
                    'setLED': 'set led [COLOR] [SWITCH]',
                    'setLight': 'set light [COLOR] [SWITCH]',
                    'setPin': 'set pin [PIN] [SWITCH]',
                    'getDigitalPin': 'read digital pin [PIN]',
                    'getAnalogPin': 'read analog pin [PIN]',
                    'getTemperatureSensor': 'temperature (°C)',
                    'getLightSensor': 'light sensor [PORT]',
                    'getUltrasonicSensor': 'ultrasonic sensor [PORT] distance',
                    'get3AxisGyro': '3-axis gyro [AXIS] angle',
                    // Menu Items
                    'motorPort': {'motorWhite': 'white', 'motorBlue': 'blue'},
                    'servoPort': {'servoGreen': 'green', 'servoRed': 'red'},
                    'buzzerBeat': {'half': 'half', 'quarter': 'quarter', 'eighth': 'eighth', 'whole': 'whole', 'double': 'double'},
                    'ledColor': {'ledRed': 'red', 'ledYellow': 'yellow', 'ledGreen': 'green'},
                    'ledSwitch': {'ledOn': 'on', 'ledOff': 'off'},
                    'lightColor': {'lightRed': 'red', 'lightBlue': 'blue', 'lightGreen': 'green'},
                    'lightSwitch': {'lightOn': 'on', 'lightOff': 'off'},
                    'pinSwitch': {'pinOn': 'on', 'pinOff': 'off'},
                    'analogPin': {'analogPin1': '1', 'analogPin2': '2'},
                    'lightSensorPort': {'lightSensorRed': 'red', 'lightSensorGreen': 'green'},
                    'ultrasonicSensorPort': {'ultrasonicSensorWhite': 'white', 'ultrasonicSensorBlue': 'blue'},
                    '3AxisGyroAxis': {'3AxisGyroXAxis': 'X-Axis', '3AxisGyroYAxis': 'Y-Axis', '3AxisGyroZAxis': 'Z-Axis'}
                },
                'zh-tw': {
                    'name': 'BrainGO',
                    'setMotor': '設置馬達 [PORT] 轉速為 (-255~255) [VALUE]',
                    'setServo': '設置舵機 [PORT] 角度 (0~180) [VALUE]',
                    'setBuzzer': '播放 音調為 [NOTE] 節拍為 [BEAT]',
                    'setLED': '設置LED [COLOR] [SWITCH]',
                    'setLight': '設置燈 [COLOR] [SWITCH]',
                    'setPin': '設置腳位 [PIN] [SWITCH]',
                    'getDigitalPin': '讀取數位訊號腳位 [PIN]',
                    'getAnalogPin': '讀取類比訊號腳位 [PIN]',
                    'getTemperatureSensor': '溫度 (°C)',
                    'getLightSensor': '光感測器 [PORT]',
                    'getUltrasonicSensor': '超音波感測器 [PORT] 距離',
                    'get3AxisGyro': '三軸陀螺儀 [AXIS] 角度',
                    // Menu Items
                    'motorPort': {'motorWhite': '白色', 'motorBlue': '藍色'},
                    'servoPort': {'servoGreen': '綠色', 'servoRed': '紅色'},
                    'buzzerBeat': {'half': '二分之一', 'quarter': '四分之一', 'eighth': '八分之一', 'whole': '整拍', 'double': '雙拍'},
                    'ledColor': {'ledRed': '紅色', 'ledYellow': '黃色', 'ledGreen': '綠色'},
                    'ledSwitch': {'ledOn': '開', 'ledOff': '關'},
                    'lightColor': {'lightRed': '紅色', 'lightBlue': '藍色', 'lightGreen': '綠色'},
                    'lightSwitch': {'lightOn': '亮', 'lightOff': '不亮'},
                    'pinSwitch': {'pinOn': '開', 'pinOff': '關'},
                    'analogPin': {'analogPin1': '1', 'analogPin2': '2'},
                    'lightSensorPort': {'lightSensorRed': '紅色', 'lightSensorGreen': '綠色'},
                    'ultrasonicSensorPort': {'ultrasonicSensorWhite': '白色', 'ultrasonicSensorBlue': '藍色'},
                    '3AxisGyroAxis': {'3AxisGyroXAxis': 'X軸', '3AxisGyroYAxis': 'Y軸', '3AxisGyroZAxis': 'Z軸'}
                }
            },
        };
    }

    static BrainGOArduino (gen){
        gen.includes_['BrainGO'] = '#include <MeMCore.h>';
    };

    static MenuItemValue (key){
        let values = {
            'motorWhite': 9, 'motorBlue':10,
            'servoGreen': 10, 'servoRed':9,
            'B0': 31,
            'C1': 33, 'D1': 37, 'E1': 41, 'F1': 44, 'G1': 49, 'A1': 55, 'B1': 62,
            'C2': 65, 'D2': 73, 'E2': 82, 'F2': 87, 'G2': 98, 'A2': 110, 'B2': 123,
            'C3': 131, 'D3': 147, 'E3': 165, 'F3': 175, 'G3': 196, 'A3': 220, 'B3': 247,
            'C4': 262, 'D4': 294, 'E4': 330, 'F4': 349, 'G4': 392, 'A4': 440, 'B4': 494,
            'C5': 523, 'D5': 587, 'E5': 659, 'F5': 698, 'G5': 784, 'A5': 880, 'B5': 988,
            'C6': 1047, 'D6': 1175, 'E6': 1319, 'F6': 1397, 'G6': 1568, 'A6': 1760, 'B6': 1976,
            'C7': 2093, 'D7': 2349, 'E7': 2637, 'F7': 2794, 'G7': 3136, 'A7': 3520, 'B7': 3951,
            'C8': 4186, 'D8': 4699,
            'half': 500, 'quarter': 250, 'eighth': 125, 'whole': 1000, 'double': 2000,
            'ledRed': 9, 'ledYellow':11, 'ledGreen':10,
            'ledOn': 0, 'ledOff': 1,
            'lightRed': 2, 'lightBlue':3, 'lightGreen':16,
            'lightOn': 1, 'lightOff': 0,
            'PC1':15, 'PC2':16, 'PC3':17, 'PC4':18, 'PC5':19,
            'pinOn': 0, 'pinOff': 1,
            'analogPin1': 15, 'analogPin2': 16,
            'lightSensorRed': 9, 'lightSensorGreen': 10,
            'ultrasonicSensorWhite': 12, 'ultrasonicSensorBlue': 13,
            '3AxisGyroXAxis': 1, '3AxisGyroYAxis': 2, '3AxisGyroZAxis': 3
        };
        let value = values[key];
        if (value == undefined){
            value = Number(key);
        }
        return value;
    }

    /************************************************** Function **************************************************/

    setMotor (args){
        console.log('setMotor');
        let port = BrainGOExtension.MenuItemValue(args.PORT);
        let value = args.VALUE;
        console.log(port);
        console.log(value);
    }

    setServo (args){
        console.log('setServo');
        let port = BrainGOExtension.MenuItemValue(args.PORT);
        let value = args.VALUE;
        console.log(port);
        console.log(value);
    }

    setBuzzer (args){
        console.log('setBuzzer');
        let note = BrainGOExtension.MenuItemValue(args.NOTE);
        let beat = BrainGOExtension.MenuItemValue(args.BEAT);
        console.log(note);
        console.log(beat);
    }

    setLED (args){
        console.log('setLED');
        let color = BrainGOExtension.MenuItemValue(args.COLOR);
        let sw = BrainGOExtension.MenuItemValue(args.SWITCH);
        console.log(color);
        console.log(sw);
    }

    setLight (args){
        console.log('setLight');
        let color = BrainGOExtension.MenuItemValue(args.COLOR);
        let sw = BrainGOExtension.MenuItemValue(args.SWITCH);
        console.log(color);
        console.log(sw);
    }

    setPin (args){
        console.log('setPin');
        let pin = BrainGOExtension.MenuItemValue(args.PIN);
        let sw = BrainGOExtension.MenuItemValue(args.SWITCH);
        console.log(pin);
        console.log(sw);
    }

    getDigitalPin (args){
        console.log('getDigitalPin');
        let pin = args.PIN;
        console.log(pin);
    }

    getAnalogPin (args){
        console.log('getAnalogPin');
        let pin = BrainGOExtension.MenuItemValue(args.PIN);
        console.log(pin);
    }

    getTemperatureSensor (args){
        console.log('getTemperatureSensor');
    }

    getLightSensor (args){
        console.log('getLightSensor');
        let port = BrainGOExtension.MenuItemValue(args.PORT);
        console.log(port);
    }

    getUltrasonicSensor (args){
        console.log('getUltrasonicSensor');
        let port = BrainGOExtension.MenuItemValue(args.PORT);
        console.log(port);
    }

    get3AxisGyro (args){
        console.log('get3AxisGyro');
        let axis = BrainGOExtension.MenuItemValue(args.AXIS);
        console.log(axis);
    }

    /************************************************** Arduino **************************************************/
    setMotorArduino (gen, block){
        const port = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'PORT'));
        const value = gen.valueToCode(block, 'VALUE');
        BrainGOExtension.BrainGOArduino(gen);
        let code = gen.line(`motor_${port}.run((${port}) == M1 ? -(${value}) : (${value}))`);
        return code;
    }

    setServoArduino (gen, block){
        const port = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'PORT'));
        const value = gen.valueToCode(block, 'VALUE');
        BrainGOExtension.BrainGOArduino(gen);
        gen.definitions_[`setServo`] = `\nvoid servopulse(int port, float angle){\n  int pulsewidth = (angle * 11) + 530;\n  digitalWrite(port, HIGH);\n  delayMicroseconds(pulsewidth);\n  digitalWrite(port, LOW);\n  delayMicroseconds(20000 - pulsewidth);\n}\n`;
        gen.setupCodes_[`setServo_${port}`] = `pinMode(${port}, OUTPUT)`;
        let code = gen.line(`servopulse(${port}, ${value})`);
        return code;
    }

    setBuzzerArduino (gen, block){
        const note = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'NOTE'));
        const beat = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'BEAT'));
        BrainGOExtension.BrainGOArduino(gen);
        gen.definitions_[`setBuzzer`] = `MeBuzzer buzzer;`;
        let code = gen.line(`buzzer.tone(${note}, ${beat})`);
        code += gen.line(`delay(20)`);
        return code;
    }

    setLEDArduino (gen, block){
        const color = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'COLOR'));
        const sw = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'SWITCH'));
        BrainGOExtension.BrainGOArduino(gen);
        gen.setupCodes_[`setLED_${color}`] = `pinMode(${color}, OUTPUT)`;
        let code = gen.line(`digitalWrite(${color}, ${sw})`);
        return code;
    }

    setLightArduino (gen, block){
        const color = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'COLOR'));
        const sw = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'SWITCH'));
        BrainGOExtension.BrainGOArduino(gen);
        gen.setupCodes_[`setLight_${color}`] = `pinMode(${color}, OUTPUT)`;
        let code = gen.line(`digitalWrite(${color}, ${sw})`);
        return code;
    }

    setPinArduino (gen, block){
        const pin = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'PIN'));
        const sw = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'SWITCH'));
        BrainGOExtension.BrainGOArduino(gen);
        gen.setupCodes_[`setPin_${pin}`] = `pinMode(${pin}, OUTPUT)`;
        let code = gen.line(`digitalWrite(${pin}, ${sw})`);
        return code;
    }

    getDigitalPinArduino (gen, block){
        const pin = gen.valueToCode(block, 'PIN');
        BrainGOExtension.BrainGOArduino(gen);
        gen.setupCodes_[`getDigitalPin_${pin}`] = `pinMode(${pin}, INPUT)`;
        let code = `digitalRead(${pin})`;
        return [code, 0];
    }

    getAnalogPinArduino (gen, block){
        const pin = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'PIN'));
        BrainGOExtension.BrainGOArduino(gen);
        gen.setupCodes_[`getAnalogPin_${pin}`] = `pinMode(${pin}, INPUT)`;
        let code = `analogRead(${pin})`;
        return [code, 0];
    }

    getTemperatureSensorArduino (gen, block){
        BrainGOExtension.BrainGOArduino(gen);
        gen.setupCodes_[`getTemperatureSensor`] = `pinMode(A0, INPUT)`;
        let code = `(((analogRead(A0) * 50) / 10) - 500) / 10`;
        return [code, 0];
    }

    getLightSensorArduino (gen, block){
        const port = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'PORT'));
        BrainGOExtension.BrainGOArduino(gen);
        gen.setupCodes_[`getLightSensor_${port}`] = `pinMode(${port}, INPUT)`;
        let code = `digitalRead(${port})`;
        return [code, 0];
    }

    getUltrasonicSensorArduino (gen, block){
        const port = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'PORT'));
        BrainGOExtension.BrainGOArduino(gen);
        gen.definitions_[`getUltrasonicSensor`] = `\nfloat getDistance(int trig){\n  char A = 0;\n  char B = 0;\n  char C = 0;\n  if(trig == 12){ A = 13; B = 12; }else{ A = 2; B = 3; }\n  pinMode(A, OUTPUT);\n  digitalWrite(A, LOW);\n  delayMicroseconds(2);\n  digitalWrite(A, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(A, LOW);\n  pinMode(B, INPUT);\n  C = pulseIn(B, HIGH, 30000) / 58.0;\n  if(C <= 1){ return 400; }else{ return C; }\n}\n`;
        let code = `getDistance(${port})`;
        return [code, 0];
    }

    get3AxisGyroArduino (gen, block){
        const axis = BrainGOExtension.MenuItemValue(gen.valueToCode(block, 'AXIS'));
        BrainGOExtension.BrainGOArduino(gen);
        gen.definitions_[`get3AxisGyro`] = `MeGyro gyro;`;
        gen.setupCodes_[`get3AxisGyro`] = `gyro.begin()`;
        gen.loopCodes_[`get3AxisGyro`] = `gyro.update()`;
        let code = `gyro.getAngle(${axis})`;
        return [code, 0];
    }
}

module.exports = BrainGOExtension;