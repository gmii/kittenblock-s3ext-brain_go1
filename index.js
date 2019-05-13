/**
 * Created by STLeee on 2019/5/8.
 */

const ArgumentType = Scratch.ArgumentType;
const BlockType = Scratch.BlockType;
const formatMessage = Scratch.formatMessage;
const log = Scratch.log;

const BrainGOArduino = gen => {
    gen.includes_['BrainGO'] = '#include <MeMCore.h>';
};

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
                {
                    opcode: 'setMotor',
                    blockType: BlockType.COMMAND,

                    text: formatMessage({
                        id: 'BrainGO.setMotor',
                        default: 'set motor [PORT] speed [VALUE]'
                    }),
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 9,
                            menu: 'motorPort'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        }
                    },
                    func: 'setMotor',
                    gen: {
                        arduino: this.setMotorArduino
                    }
                },
                {
                    opcode: 'setServo',
                    blockType: BlockType.COMMAND,

                    text: formatMessage({
                        id: 'BrainGO.setServo',
                        default: 'set servo [PORT] angle [VALUE]'
                    }),
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10,
                            menu: 'servoPort'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90,
                        }
                    },
                    func: 'setServo',
                    gen: {
                        arduino: this.setServoArduino
                    }
                },
                {
                    opcode: 'setBuzzer',
                    blockType: BlockType.COMMAND,

                    text: formatMessage({
                        id: 'BrainGO.setBuzzer',
                        default: 'play tone on note [NOTE] beat [BEAT]'
                    }),
                    arguments: {
                        NOTE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 262,
                            menu: 'buzzerNote'
                        },
                        BEAT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 500,
                            menu: 'buzzerBeat'
                        }
                    },
                    func: 'setBuzzer',
                    gen: {
                        arduino: this.setBuzzerArduino
                    }
                }
            ],

            menus: {
                motorPort: [
                    {text: formatMessage({id: 'BrainGO.white', default: 'white'}), value: 9}, 
                    {text: formatMessage({id: 'BrainGO.blue', default: 'blue'}), value: 10}],
                servoPort: [
                    {text: formatMessage({id: 'BrainGO.green', default: 'green'}), value: 10}, 
                    {text: formatMessage({id: 'BrainGO.red', default: 'red'}), value: 9}],
                buzzerNote: [
                    {text: 'B0', value: 31}, 
                    {text: 'C1', value: 33}, {text: 'D1', value: 37}, {text: 'E1', value: 41}, {text: 'F1', value: 44}, {text: 'G1', value: 49}, {text: 'A1', value: 55}, {text: 'B1', value: 62},
                    {text: 'C2', value: 65}, {text: 'D2', value: 73}, {text: 'E2', value: 82}, {text: 'F2', value: 87}, {text: 'G2', value: 98}, {text: 'A2', value: 110}, {text: 'B2', value: 123},
                    {text: 'C3', value: 131}, {text: 'D3', value: 147}, {text: 'E3', value: 165}, {text: 'F3', value: 175}, {text: 'G3', value: 196}, {text: 'A3', value: 220}, {text: 'B3', value: 247},
                    {text: 'C4', value: 262}, {text: 'D4', value: 294}, {text: 'E4', value: 330}, {text: 'F4', value: 349}, {text: 'G4', value: 392}, {text: 'A4', value: 440}, {text: 'B4', value: 494},
                    {text: 'C5', value: 523}, {text: 'D5', value: 587}, {text: 'E5', value: 659}, {text: 'F5', value: 698}, {text: 'G5', value: 784}, {text: 'A5', value: 880}, {text: 'B5', value: 988},
                    {text: 'C6', value: 1047}, {text: 'D6', value: 1175}, {text: 'E6', value: 1319}, {text: 'F6', value: 1397}, {text: 'G6', value: 1568}, {text: 'A6', value: 1760}, {text: 'B6', value: 1976},
                    {text: 'C7', value: 2093}, {text: 'D7', value: 2349}, {text: 'E7', value: 2637}, {text: 'F7', value: 2794}, {text: 'G7', value: 3136}, {text: 'A7', value: 3520}, {text: 'B7', value: 3951},
                    {text: 'C8', value: 4186}, {text: 'D8', value: 4699}],
                buzzerBeat:[
                    {text: formatMessage({id: 'BrainGO.half', default: 'half'}), value: 500},
                    {text: formatMessage({id: 'BrainGO.quarter', default: 'quarter'}), value: 250},
                    {text: formatMessage({id: 'BrainGO.eighth', default: 'eighth'}), value: 125},
                    {text: formatMessage({id: 'BrainGO.whole', default: 'whole'}), value: 1000},
                    {text: formatMessage({id: 'BrainGO.double', default: 'double'}), value: 2000}]
            },

            translation_map: {
                'en': {
                    name: 'BrainGO',
                    setMotor: 'set motor [PORT] speed (-255~255) [VALUE]',
                    setServo: 'set servo [PORT] angle (0~180) [VALUE]',
                    setBuzzer: 'play tone on note [NOTE] beat [BEAT]',
                    // Menu Items
                    white: 'white', blue: 'blue',
                    green: 'green', red: 'red',
                    half: 'half', quarter: 'quarter', eighth: 'eighth', whole: 'whole', double: 'double'
                },
                'zh-tw': {
                    name: 'BrainGO',
                    setMotor: '設置馬達 [PORT] 轉速為 (-255~255) [VALUE]',
                    setServo: '設置舵機 [PORT] 角度 (0~180) [VALUE]',
                    setBuzzer: '播放 音調為 [NOTE] 節拍為 [BEAT]',
                    // Menu Items
                    white: '白色', blue: '藍色',
                    green: '綠色', red: '紅色',
                    half: '二分之一', quarter: '四分之一', eighth: '八分之一', whole: '整拍', double: '雙拍',
                }
            },
        };
    }

    /************************************************** Function **************************************************/

    setMotor (args){
        console.log('setMotor');
        let port = args.PORT;
        let value = args.VALUE;
        console.log(port);
        console.log(value);
    }

    setServo (args){
        console.log('setServo');
        let port = args.PORT;
        let value = args.VALUE;
        console.log(port);
        console.log(value);
    }

    setBuzzer (args){
        console.log('setBuzzer');
        let note = args.NOTE;
        let beat = args.BEAT;
        console.log(note);
        console.log(beat);
    }

    /************************************************** Arduino **************************************************/
    setMotorArduino (gen, block){
        const port = gen.valueToCode(block, 'PORT');
        const value = gen.valueToCode(block, 'VALUE');
        BrainGOArduino(gen);
        let code = gen.line(`motor_${port}.run((${port}) == M1 ? -(${value}) : (${value}))`);
        return code;
    }

    setServoArduino (gen, block){
        const port = gen.valueToCode(block, 'PORT');
        const value = gen.valueToCode(block, 'VALUE');
        BrainGOArduino(gen);
        gen.definitions_[`setServo`] = `\nvoid servopulse(int port, float angle){\n  int pulsewidth = (angle * 11) + 530;\n  digitalWrite(port, HIGH);\n  delayMicroseconds(pulsewidth);\n  digitalWrite(port, LOW);\n  delayMicroseconds(20000 - pulsewidth);\n}`;
        gen.setupCodes_[`setServo_${port}`] = `pinMode(${port}, OUTPUT)`;
        let code = gen.line(`servopulse(${port}, ${value})`);
        return code;
    }

    setBuzzerArduino (gen, block){
        const note = gen.valueToCode(block, 'NOTE');
        const beat = gen.valueToCode(block, 'BEAT');
        BrainGOArduino(gen);
        gen.definitions_[`setBuzzer`] = `MeBuzzer buzzer;`;
        let code = gen.line(`buzzer.tone(${note}, ${beat})`);
        code += gen.line(`delay(20)`);
        return code;
    }
}

module.exports = BrainGOExtension;