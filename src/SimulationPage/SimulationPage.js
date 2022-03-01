import * as React from "react";
import { useState, useEffect} from "react";
import { useXarrow} from "react-xarrows";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box } from "@mui/system";
import Draggable from "react-draggable";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import background1 from "../Background/Night.png";
import background2 from "../Background/Crazy.png";
import background3 from "../Background/Calm.jpg";
import { Button} from "@mui/material";
import Typography from "@mui/material/Typography";

const boxStyle = {
  border: "grey solid 2px",
  borderRadius: "10px",
  padding: "5px",
};

const DraggableBox = ({ id }) => {
  const updateXarrow = useXarrow();
  return (
    <Draggable onDrag={updateXarrow} onStop={updateXarrow}>
      <div id={id} style={boxStyle}>
        {id}
      </div>
    </Draggable>
  );
};

function SimulationPage() {
  function createInstruction(index, arr) {
    let temp = instructionQueue;
    temp.push({
      index: index,
      op: arr[0],
      destination: arr[1],
      j: arr[2],
      k: arr[0] === "L.D" || arr[0] === "S.D" ? "" : arr[3],
      issue: Clock,
      startExecution: -1,
      endExecution: -1,
      write: -1,
    });
    setInstructionQueue(temp);
  }

  function checkAvailableSlot(s) {
    if (s === "ADD.D" || s === "SUB.D") {
      for (let i = 0; i <= AdderReservationStation.length - 1; i++) {
        let check = AdderReservationStation[i].busy;

        if (i === AdderReservationStation.length - 1 && check !== 0) {
          return -1;
        }
        if (check === 0) {
          return i;
        }
      }
    }

    if (s === "MUL.D" || s === "DIV.D") {
      for (let i = 0; i <= MulReservationStation.length - 1; i++) {
        let check = MulReservationStation[i].busy;

        if (i === MulReservationStation.length - 1 && check !== 0) {
          return -1;
        }
        if (check === 0) {
          return i;
        }
      }
    }
    if (s === "L.D") {
      for (let i = 0; i <= LoadBuffer.length - 1; i++) {
        let check = LoadBuffer[i].busy;

        if (i === LoadBuffer.length - 1 && check !== 0) {
          return -1;
        }
        if (check === 0) {
          return i;
        }
      }
    }
    if (s === "S.D") {
      for (let i = 0; i <= StoreBuffer.length - 1; i++) {
        let check = StoreBuffer[i].busy;

        if (i === StoreBuffer.length - 1 && check !== 0) {
          return -1;
        }
        if (check === 0) {
          return i;
        }
      }
    }
  }

  function prepareAdderStation(n, arr) {
    let instructionName = "A" + (n + 1);
    let aReservationStation = AdderReservationStation;
    if (RegisterFile[Number(arr[2].slice(1))].Qi === "0") {
      //no element in register File
      aReservationStation[n].Vj = RegisterFile[Number(arr[2].slice(1))].value;
    } else {
      aReservationStation[n].Qj = RegisterFile[Number(arr[2].slice(1))].Qi;
    }
    if (RegisterFile[Number(arr[3].slice(1))].Qi === "0") {
      aReservationStation[n].Vk = RegisterFile[Number(arr[3].slice(1))].value;
    } else {
      aReservationStation[n].Qk = RegisterFile[Number(arr[3].slice(1))].Qi;
    }
    aReservationStation[n].op = arr[0] === "ADD.D" ? "ADD" : "SUB";
    aReservationStation[n].busy = 1;
    setAdderReservationStation(aReservationStation);
    let temp = RegisterFile;
    let destinationNumber = Number(arr[1].slice(1));
    temp[destinationNumber].Qi = instructionName;
    let regColor = RegisterFileColor;
    regColor[destinationNumber] = editedColor;
    setRegisterFileColor(regColor);
    setRegisterFile(temp);
    let color = AdderReservationStationColor;
    color[n] = editedColor;
    setAdderReservationStationColor(color);
  }
  function prepareMulStation(n, arr) {
    let instructionName = "M" + (n + 1);
    let mReservationStation = MulReservationStation;
    if (RegisterFile[Number(arr[2].slice(1))].Qi === "0") {
      //no element in register File
      mReservationStation[n].Vj = RegisterFile[Number(arr[2].slice(1))].value;
    } else {
      mReservationStation[n].Qj = RegisterFile[Number(arr[2].slice(1))].Qi;
    }
    if (RegisterFile[Number(arr[3].slice(1))].Qi === "0") {
      mReservationStation[n].Vk = RegisterFile[Number(arr[3].slice(1))].value;
    } else {
      mReservationStation[n].Qk = RegisterFile[Number(arr[3].slice(1))].Qi;
    }
    mReservationStation[n].op = arr[0] === "MUL.D" ? "MUL" : "DIV";
    mReservationStation[n].busy = 1;
    setMulReservationStation(mReservationStation);
    let temp = RegisterFile;
    let destinationNumber = Number(arr[1].slice(1));
    temp[destinationNumber].Qi = instructionName;
    let regColor = RegisterFileColor;
    regColor[destinationNumber] = editedColor;
    setRegisterFileColor(regColor);
    setRegisterFile(temp);
    let color = MulReservationStationColor;
    color[n] = editedColor;
    setMulReservationStationColor(color);
  }
  function prepareStoreBuffer(n, arr) {
    let sBuffer = StoreBuffer;
    if (RegisterFile[Number(arr[1].slice(1))].Qi === "0") {
      //no element in register File
      sBuffer[n].V = RegisterFile[Number(arr[1].slice(1))].value;
    } else {
      sBuffer[n].Q = RegisterFile[Number(arr[1].slice(1))].Qi;
    }
    sBuffer[n].address = Number(arr[2]);
    sBuffer[n].busy = 1;

    setStoreBuffer(sBuffer);
    let color = StoreBufferColor;
    color[n] = editedColor;
    setStoreBufferColor(color);
  }
  const prepareLoadBuffer = (n, arr) => {
    let instructionName = "L" + (n + 1);
    let lBuffer = LoadBuffer;

    lBuffer[n].address = Number(arr[2]);
    lBuffer[n].busy = 1;
    setLoadBuffer(lBuffer);
    let temp = RegisterFile;
    let destinationNumber = Number(arr[1].slice(1));
    temp[destinationNumber].Qi = instructionName;
    let regColor = RegisterFileColor;
    regColor[destinationNumber] = editedColor;
    setRegisterFileColor(regColor);

    setRegisterFile(temp);
    let color = LoadBufferColor;
    color[n] = editedColor;
    setLoadBufferColor(color);
  };

  function prepareReservationStation(n, arr) {
    switch (arr[0]) {
      case "ADD.D": {
        prepareAdderStation(n, arr);
        break;
      }
      case "SUB.D": {
        prepareAdderStation(n, arr);
        break;
      }
      case "MUL.D":
        prepareMulStation(n, arr);
        break;
      case "DIV.D":
        prepareMulStation(n, arr);
        break;

      case "S.D":
        prepareStoreBuffer(n, arr);
        break;
      case "L.D":
        prepareLoadBuffer(n, arr);
        break;
      default:
        break;
    }
  }

  function getLatency(op) {
    switch (op) {
      case "ADD.D":
      case "SUB.D":
        return AddSubInstructionLatency;

      case "MUL.D":
        return MulInstructionLatency;

      case "DIV.D":
        return DivInstructionLatency;

      case "S.D":
        return StoreInstructionLatency;
      case "L.D":
        return LoadInstructionLatency;

      default:
        break;
    }
  }
  function allOperandsReady(op, index) {
    switch (op) {
      case "ADD.D":
        return (
          AdderReservationStation[index].Vj !== "" &&
          AdderReservationStation[index].Vk !== ""
        );
      case "SUB.D":
        return (
          AdderReservationStation[index].Vj !== "" &&
          AdderReservationStation[index].Vk !== ""
        );

      case "DIV.D":
        return (
          MulReservationStation[index].Vj !== "" &&
          MulReservationStation[index].Vk !== ""
        );
      case "MUL.D":
        return (
          MulReservationStation[index].Vj !== "" &&
          MulReservationStation[index].Vk !== ""
        );

      case "S.D":
        console.log(StoreBuffer[index]);
        return StoreBuffer[index].V !== "";
      case "L.D":
        return true;

      default:
        break;
    }
  }

  function giveAllWaiting(newAdd0, newMul0, newStore0, op, index, val) {
    let newAdd = newAdd0;
    let newMul = newMul0;
    let newStore = newStore0;
    let newLoad = LoadBuffer;
    let newReg = RegisterFile;
    let key = "";
    switch (op) {
      case "ADD.D":
      case "SUB.D":
        key = "A" + (index + 1);
        newAdd[index].busy = 0;
        newAdd[index].op = "";
        newAdd[index].Vj = "";
        newAdd[index].Vk = "";
        newAdd[index].Qj = "";
        newAdd[index].Qk = "";
        let adderColor = AdderReservationStationColor;
        adderColor[index] = removedColor;
        setAdderReservationStationColor(adderColor);
        break;

      case "MUL.D":
      case "DIV.D":
        key = "M" + (index + 1);
        newMul[index].busy = 0;
        newMul[index].op = "";
        newMul[index].Vj = "";
        newMul[index].Vk = "";
        newMul[index].Qj = "";
        newMul[index].Qk = "";
        let mulColor = MulReservationStationColor;
        mulColor[index] = removedColor;
        setMulReservationStationColor(mulColor);
        break;

      case "S.D":
        // busy: 0, address: -1, V: "", Q: ""
        newStore[index].busy = 0;
        newStore[index].address = -1;
        newStore[index].V = "";
        newStore[index].Q = "";
        let sColor = StoreBufferColor;
        sColor[index] = removedColor;
        setStoreBufferColor(sColor);
        break;
      case "L.D":
        key = "L" + (index + 1);
        //busy: 0, address: -1
        newLoad[index].busy = 0;
        newLoad[index].address = -1;
        let lColor = LoadBufferColor;
        lColor[index] = removedColor;
        setLoadBufferColor(lColor);
        break;

      default:
        break;
    }
    //update waiting resStation
    for (let i = 0; i < 3; i++) {
      if (StoreBuffer[i].Q === key) {
        newStore[i].V = val;
        newStore[i].Q = "";
        let sColor = StoreBufferColor;
        sColor[i] = editedColor;
        setStoreBufferColor(sColor);
      }

      if (AdderReservationStation[i].Qj === key) {
        newAdd[i].Qj = "";
        newAdd[i].Vj = val;
        let adderColor = AdderReservationStationColor;
        adderColor[i] = editedColor;
        setAdderReservationStationColor(adderColor);
      }
      if (AdderReservationStation[i].Qk === key) {
        newAdd[i].Qk = "";
        newAdd[i].Vk = val;
        let adderColor = AdderReservationStationColor;
        adderColor[i] = editedColor;
        setAdderReservationStationColor(adderColor);
      }

      if (i < 2 && MulReservationStation[i].Qj === key) {
        newMul[i].Qj = "";
        newMul[i].Vj = val;
        let mulColor = MulReservationStationColor;
        mulColor[i] = editedColor;
        setMulReservationStationColor(mulColor);
      }
      if (i < 2 && MulReservationStation[i].Qk === key) {
        newMul[i].Qk = "";
        newMul[i].Vk = val;
        let mulColor = MulReservationStationColor;
        mulColor[i] = editedColor;
        setMulReservationStationColor(mulColor);
      }
    }

    for (let i = 0; i < 32; i++) {
      if (RegisterFile[i].Qi === key) {
        newReg[i].Qi = "0";
        newReg[i].value = val;
        let regColor = RegisterFileColor;
        regColor[i] = editedColor;
        setRegisterFileColor(regColor);
      }
    }
    //setAdderReservationStation(AdderReservationStation);
    //setMulReservationStation(MulReservationStation);
    setRegisterFile(newReg);
    setLoadBuffer(newLoad);
    return { newAdd, newMul, newStore };
  }

  function getWriteValue(op, index) {
    switch (op) {
      case "ADD.D":
        return (
          Number(AdderReservationStation[index].Vj) +
          Number(AdderReservationStation[index].Vk)
        );
      case "SUB.D":
        return (
          Number(AdderReservationStation[index].Vj) -
          Number(AdderReservationStation[index].Vk)
        );

      case "MUL.D":
        return (
          MulReservationStation[index].Vj * MulReservationStation[index].Vk
        );
      case "DIV.D":
        return (
          MulReservationStation[index].Vj / MulReservationStation[index].Vk
        );

      case "L.D":
        return ReadFromMemory(LoadBuffer[index].address);

      default:
        break;
    }
  }
  function loopOnQueue() {
    let newQueue = JSON.parse(JSON.stringify(instructionQueue));
    let newAdd = JSON.parse(JSON.stringify(AdderReservationStation));
    let newMul = JSON.parse(JSON.stringify(MulReservationStation));
    let newStore = JSON.parse(JSON.stringify(StoreBuffer));
    let SomeoneAlreadyWroteThisCycle = false;
    for (let i = 0; i < instructionQueue.length; i++) {
      let instruction = instructionQueue[i];
      if (instruction.write === -1) {
        if (instruction.endExecution === -1) {
          if (instruction.startExecution === -1) {
            if (instruction.issue !== Clock) {
              console.log(instruction);
              console.log(newStore);
              if (allOperandsReady(instruction.op, instruction.index)) {
                newQueue[i].startExecution = Clock;
                if (Number(getLatency(instruction.op)) === 1) {
                  newQueue[i].endExecution = Clock;
                }
              }

              console.log(newQueue);
            }
          } else {
            let latency = Number(getLatency(instruction.op));
            if (Clock === instruction.startExecution + latency - 1) {
              newQueue[i].endExecution = Clock;
            }
          }
        } else {
          if (instruction.op !== "S.D") {
            console.log("Writing");

            //write on bus
            if (!SomeoneAlreadyWroteThisCycle) {
              let val = getWriteValue(instruction.op, instruction.index);
              let udpatedStations = giveAllWaiting(
                newAdd,
                newMul,
                newStore,
                instruction.op,
                instruction.index,
                val
              );
              newAdd = udpatedStations.newAdd;
              newMul = udpatedStations.newMul;
              newStore = udpatedStations.newStore;
              SomeoneAlreadyWroteThisCycle = true;
              console.log(newMul);
              console.log(MulReservationStation);
              newQueue[i].write = Clock;
              //setInstructionQueue(instructionQueue);
            }
          } else {
            insertInMemory(
              StoreBuffer[instruction.index].address,
              StoreBuffer[instruction.index].V
            );
            newStore[instruction.index].busy = 0;
            newStore[instruction.index].address = -1;
            newStore[instruction.index].V = "";
            newStore[instruction.index].Q = "";
            let sColor = StoreBufferColor;
            sColor[instruction.index] = removedColor;
            setStoreBufferColor(sColor);

            newQueue[i].write = Clock;
          }
        }
      }
    }
    setInstructionQueue(newQueue);
    setAdderReservationStation(newAdd);
    setMulReservationStation(newMul);
    setStoreBuffer(newStore);
  }
  const insertInMemory = (address, newValue) => {
    console.log(address);
    console.log(newValue);
    let temp = JSON.parse(JSON.stringify(Memory));
    for (let x in temp) {
      let element = temp[x];
      console.log(element);
      if (element.memoryAddress === address) {
        element.value = newValue;
        break;
      }
    }
    console.log("Temp");
    console.log(temp);
    console.log("Memory");
    console.log(Memory);
    setMemory(temp);
  };

  const ReadFromMemory = (address) => {
    for (let x in Memory) {
      let element = Memory[x];
      console.log(element + "a:" + address);

      if (Number(element.memoryAddress) === address) {
        console.log("Balabizo" + element.value);
        return Number(element.value);
      }
    }
  };

  const handleClick = () => {
    if (startExecution) {
      if (nextInstruction < Instructions.length) {
        let arr = Instructions[nextInstruction].Instruction.split(/[\s,]+/);
        let n = checkAvailableSlot(arr[0]);

        if (n !== -1) {
          createInstruction(n, arr);
          prepareReservationStation(n, arr);
          setNextInstruction(nextInstruction + 1);
        }
      }
      loopOnQueue();

      setStartExecution(false);
    } else {
      resetColors();
      setClock(Clock + 1);
      setStartExecution(true);
    }
  };
  const [startExecution, setStartExecution] = useState(false);
  const [nextInstruction, setNextInstruction] = useState(0);
  const [instructionQueue, setInstructionQueue] = useState([]);
  const [Clock, setClock] = useState(0);

  const [editedColor, seteditedColor] = useState("#4E5860");
  // eslint-disable-next-line no-unused-vars
  const [removedColor, setremovedColor] = useState("#6E276C");
  const [defaultColor, setdefaultColor] = useState("#A6ABAF");
  const [headerColor, setheaderColor] = useState("#26313B");
  const [tablebackgroundColor, settablebackgroundColor] = useState(
    "rgba(38, 49, 59, 0.4)"
  );
  const [borderColor, setborderColor] = useState("0px 0px 3px 3px #26313B");

  const [theme, settheme] = useState("Night");
  const themeclasses = [
    {
      value: "Night",
      label: "Night",
    },
    {
      value: "Crazy",
      label: "Crazy",
    },
    {
      value: "Calm",
      label: "Calm",
    },
  ];

  const handleClickTheme = () => {
    changeeditdColor();
    changedefaultdColor();
    changeheaderColor();
    changetablebackgroundColor();
    changeborderColor();
  };
  useEffect(() => {
    handleClickTheme();
    resetColors();
  }, [theme]);
  const changeeditdColor = () => {
    if (theme === "Night") {
      seteditedColor("#4E5860");
    }
    if (theme === "Crazy") {
      seteditedColor("#F98125");
    }
    if (theme === "Calm") {
      seteditedColor("#904183");
    }
  };
  const changedefaultdColor = () => {
    if (theme === "Night") {
      setdefaultColor("#A6ABAF");
    }
    if (theme === "Crazy") {
      setdefaultColor("#5B84C4");
    }
    if (theme === "Calm") {
      setdefaultColor("#CBC3E3");
    }
  };
  const changeheaderColor = () => {
    if (theme === "Night") {
      setheaderColor("#26313B");
    }
    if (theme === "Crazy") {
      setheaderColor("#11224D ");
    }
    if (theme === "Calm") {
      setheaderColor("#702963");
    }
  };
  const changetablebackgroundColor = () => {
    if (theme === "Night") {
      settablebackgroundColor("rgba(38, 49, 59, 0.4)");
    }
    if (theme === "Crazy") {
      settablebackgroundColor("rgba(38, 49, 59, 0.4)");
    }
    if (theme === "Calm") {
      settablebackgroundColor("rgba(224, 176, 255, 0.4)");
    }
  };
  const changeborderColor = () => {
    if (theme === "Night") {
      setborderColor("0px 0px 3px 3px #26313B");
    }
    if (theme === "Crazy") {
      setborderColor("0px 0px 3px 3px #11224D");
    }
    if (theme === "Calm") {
      setborderColor("0px 0px 3px 3px #702963");
    }
  };

  const [LoadBuffer, setLoadBuffer] = useState([
    { busy: 0, address: -1 },
    { busy: 0, address: -1 },
    { busy: 0, address: -1 },
  ]);

  const [LoadBufferColor, setLoadBufferColor] = useState([
    defaultColor,
    defaultColor,
    defaultColor,
  ]);
  const [StoreBuffer, setStoreBuffer] = useState([
    { busy: 0, address: -1, V: "", Q: "" },
    { busy: 0, address: -1, V: "", Q: "" },
    { busy: 0, address: -1, V: "", Q: "" },
  ]);
  const [StoreBufferColor, setStoreBufferColor] = useState([
    defaultColor,
    defaultColor,
    defaultColor,
  ]);
  const [AdderReservationStation, setAdderReservationStation] = useState([
    { busy: 0, op: "", Vj: "", Vk: "", Qj: "", Qk: "" },
    { busy: 0, op: "", Vj: "", Vk: "", Qj: "", Qk: "" },
    { busy: 0, op: "", Vj: "", Vk: "", Qj: "", Qk: "" },
  ]);
  const [AdderReservationStationColor, setAdderReservationStationColor] =
    useState([defaultColor, defaultColor, defaultColor]);
  const [MulReservationStation, setMulReservationStation] = useState([
    { busy: 0, op: "", Vj: "", Vk: "", Qj: "", Qk: "" },
    { busy: 0, op: "", Vj: "", Vk: "", Qj: "", Qk: "" },
  ]);
  const [MulReservationStationColor, setMulReservationStationColor] = useState([
    defaultColor,
    defaultColor,
  ]);
  const [RegisterFileColor, setRegisterFileColor] = useState([
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
    defaultColor,
  ]);
  const [RegisterFile, setRegisterFile] = useState([
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
    { Qi: "0", value: 0 },
  ]);
  const [Memory, setMemory] = useState(
    JSON.parse(localStorage.getItem("Memory"))
  );
  const Instructions = JSON.parse(localStorage.getItem("Instructions"));

  const AddSubInstructionLatency = localStorage.getItem(
    "AddSubInstructionLatency"
  );
  const MulInstructionLatency = Number(
    localStorage.getItem("MulInstructionLatency")
  );
  const DivInstructionLatency = Number(
    localStorage.getItem("DivInstructionLatency")
  );
  const LoadInstructionLatency = Number(
    localStorage.getItem("LoadInstructionLatency")
  );
  const StoreInstructionLatency = Number(
    localStorage.getItem("StoreInstructionLatency")
  );
  const resetColors = () => {
    setLoadBufferColor([defaultColor, defaultColor, defaultColor]);

    setStoreBufferColor([defaultColor, defaultColor, defaultColor]);

    setAdderReservationStationColor([defaultColor, defaultColor, defaultColor]);

    setMulReservationStationColor([defaultColor, defaultColor]);

    setRegisterFileColor([
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
      defaultColor,
    ]);
  };
  return (
    <Box
      p={0}
      sx={{
        minHeight: "100%",
        position: "absolute",
        overflow: "auto",
        width: "100%",
        backgroundImage: `url(${
          theme === "Night"
            ? background1
            : theme === "Crazy"
            ? background2
            : background3
        })`,
        backgroundRepeat: "repeat-y",
      }}
    >
      <Draggable>
        <Box
          p={2}
          sx={{
            position: "absolute",
            left: "5%",
            top: "1%",
            m: "auto",
            "& > :not(style)": { mt: 0, mx: 0 },
            my: "2%",
            width: "8%",
            "text-align": "left",
            border: "0px solid #eeeeee",
            backgroundColor: tablebackgroundColor,
            "box-shadow": borderColor,
          }}
        >
          <TextField
            sx={{ width: "100%", textAlign: "center", my: "2%" }}
            type="text"
            id="outlined-basic"
            label="Theme"
            required
            select
            disabled={!startExecution}
            onChange={(e) => {
              settheme(e.target.value);
            }}
            value={theme}
          >
            {themeclasses.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Draggable>
      <Draggable>
        <Box
          p={2}
          sx={{
            position: "absolute",
            left: "5%",
            top: "14%",
            m: "auto",
            "& > :not(style)": { mt: 0, mx: 0 },
            my: "2%",
            width: "10%",
            "text-align": "left",
            border: "0px solid #eeeeee",
            backgroundColor: tablebackgroundColor,
            "box-shadow": borderColor,
          }}
        >
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a  dense table">
              <TableHead sx={{ backgroundColor: headerColor }}>
                <TableRow>
                  <TableCell align="left">
                    <Typography color="white">Instructions</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody id="instructions">
                {Instructions.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor:
                        nextInstruction === index ? editedColor : defaultColor,
                    }}
                  >
                    <TableCell align="left">{row.Instruction}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Draggable>
      <Draggable id="fpReg">
        <Box
          p={2}
          sx={{
            position: "absolute",
            left: "81%",
            m: "auto",
            "& > :not(style)": { mt: 0, mx: 0 },
            my: "2%",
            width: "15%",
            "text-align": "center",
            border: "0px solid #eeeeee",
            backgroundColor: tablebackgroundColor,
            "box-shadow": borderColor,
          }}
        >
          Register File
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableHead sx={{ backgroundColor: headerColor }}>
                <TableRow>
                  <TableCell align="left">
                    <Typography color="white">index</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography color="white">Qi</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography color="white">Value</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {RegisterFile.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor: RegisterFileColor[index],
                    }}
                  >
                    <TableCell align="left">{"F" + index}</TableCell>
                    <TableCell align="left">{row.Qi}</TableCell>
                    <TableCell align="left">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Draggable>
      <Draggable>
        <Box
          p={2}
          sx={{
            position: "absolute",
            left: "28%",
            top: "15%",
            m: "auto",
            "& > :not(style)": { mt: 0, mx: 0 },
            my: "2%",
            width: "40%",
            "text-align": "center",
            border: "0px solid #eeeeee",
            backgroundColor: tablebackgroundColor,
            "box-shadow": borderColor,
          }}
        >
          Instruction Queue
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableHead sx={{ backgroundColor: headerColor }}>
                <TableRow>
                  <TableCell align="center">
                    <Typography color="white">op</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Destination</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">j</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">k</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">issue</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Execution</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Write</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody id="instructionQueueUI">
                {instructionQueue.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor: defaultColor,
                    }}
                  >
                    <TableCell align="center">{row.op}</TableCell>
                    <TableCell align="center">{row.destination}</TableCell>
                    <TableCell align="center">{row.j}</TableCell>
                    <TableCell align="center">{row.k}</TableCell>
                    <TableCell align="center">{row.issue}</TableCell>
                    <TableCell align="center">
                      {row.startExecution !== -1
                        ? `${row.startExecution}${
                            row.startExecution !== row.endExecution
                              ? `${row.startExecution < Clock ? "..." : ""}${
                                  row.endExecution !== -1
                                    ? row.endExecution
                                    : ""
                                }`
                              : ""
                          }`
                        : ""}
                    </TableCell>
                    <TableCell align="center">
                      {row.write !== -1 && row.write}
                    </TableCell>
                    {/* <TableCell align="center">{row.write}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Draggable>
      <Draggable id="fpAddSub">
        <Box
          p={2}
          sx={{
            position: "absolute",
            top: "45%",
            left: "48%",
            m: "auto",
            "& > :not(style)": { mt: 0, mx: 0 },
            my: "3%",
            width: "30%",
            "text-align": "center",
            border: "0px solid #eeeeee",
            backgroundColor: tablebackgroundColor,
            "box-shadow": borderColor,
          }}
        >
          Add Sub buffers
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableHead sx={{ backgroundColor: headerColor }}>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="center">
                    <Typography color="white">op</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Vj</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Vk</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Qj</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Qk</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Busy</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {AdderReservationStation.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor: AdderReservationStationColor[index],
                    }}
                  >
                    <TableCell>{"A" + (index + 1)}</TableCell>
                    <TableCell align="center">{row.op}</TableCell>
                    <TableCell align="center">{row.Vj}</TableCell>
                    <TableCell align="center">{row.Vk}</TableCell>
                    <TableCell align="center">{row.Qj}</TableCell>
                    <TableCell align="center">{row.Qk}</TableCell>
                    <TableCell align="center">{row.busy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Draggable>
      <Draggable id="fpMulDiv">
        <Box
          p={2}
          sx={{
            position: "absolute",
            top: "65%",
            left: "48%",
            m: "auto",
            "& > :not(style)": { mt: 0, mx: 0 },
            my: "4%",
            width: "30%",
            "text-align": "center",
            border: "0px solid #eeeeee",
            backgroundColor: tablebackgroundColor,
            "box-shadow": borderColor,
          }}
        >
          Mul Div buffers
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableHead sx={{ backgroundColor: headerColor }}>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="center">
                    <Typography color="white">op</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Vj</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Vk</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Qj</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Qk</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Busy</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MulReservationStation.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor: MulReservationStationColor[index],
                    }}
                  >
                    <TableCell>{"M" + (index + 1)}</TableCell>
                    <TableCell align="center">{row.op}</TableCell>
                    <TableCell align="center">{row.Vj}</TableCell>
                    <TableCell align="center">{row.Vk}</TableCell>
                    <TableCell align="center">{row.Qj}</TableCell>
                    <TableCell align="center">{row.Qk}</TableCell>
                    <TableCell align="center">{row.busy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Draggable>
      <Draggable id="loadBuffer">
        <Box
          p={2}
          sx={{
            position: "absolute",
            top: "43%",
            left: "25%",
            m: "auto",
            "& > :not(style)": { mt: 0, mx: 0 },
            my: "4%",
            width: "20%",
            "text-align": "center",
            border: "0px solid #eeeeee",
            backgroundColor: tablebackgroundColor,
            "box-shadow": borderColor,
          }}
        >
          Load buffers
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableHead sx={{ backgroundColor: headerColor }}>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="center">
                    <Typography color="white">Address</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Busy</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {LoadBuffer.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor: LoadBufferColor[index],
                    }}
                  >
                    <TableCell>{"L" + (index + 1)}</TableCell>
                    <TableCell align="center">
                      {row.address !== -1 && row.address}
                    </TableCell>
                    <TableCell align="center">{row.busy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Draggable>
      <Draggable id="storeBuffer">
        <Box
          p={2}
          sx={{
            position: "absolute",
            top: "65%",
            left: "20%",
            m: "auto",
            "& > :not(style)": { mt: 0, mx: 0 },
            my: "4%",
            width: "25%",
            "text-align": "center",
            border: "0px solid #eeeeee",
            backgroundColor: tablebackgroundColor,
            "box-shadow": borderColor,
          }}
        >
          Store buffers
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableHead sx={{ backgroundColor: headerColor }}>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="center">
                    <Typography color="white">Address</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">V</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Q</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Busy</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {StoreBuffer.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor: StoreBufferColor[index],
                    }}
                  >
                    <TableCell>{"S" + (index + 1)}</TableCell>
                    <TableCell align="center">
                      {row.address !== -1 && row.address}
                    </TableCell>
                    <TableCell align="center">{row.V}</TableCell>
                    <TableCell align="center">{row.Q}</TableCell>
                    <TableCell align="center">{row.busy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Draggable>
      <Draggable id="memory">
        <Box
          p={2}
          sx={{
            position: "absolute",
            top: "40%",
            left: "2%",
            m: "auto",
            "& > :not(style)": { mt: 0, mx: 0 },
            my: "4%",
            width: "15%",
            "text-align": "center",
            border: "0px solid #eeeeee",
            backgroundColor: tablebackgroundColor,
            "box-shadow": borderColor,
          }}
        >
          Memory
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableHead sx={{ backgroundColor: headerColor }}>
                <TableRow>
                  <TableCell align="center">
                    <Typography color="white">Address</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="white">Value</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Memory.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor: defaultColor,
                    }}
                  >
                    <TableCell align="center">{row.memoryAddress}</TableCell>
                    <TableCell align="center">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Draggable>
      <Button
        variant="contained"
        onClick={() => {
          handleClick();
        }}
        sx={{
          position: "absolute",
          top: "8%",
          left: "42%",
          m: "auto",
          "& > :not(style)": { mt: 0, mx: 0 },
          width: "15%",
          "text-align": "center",
          border: "0px solid #eeeeee",
          "box-shadow": borderColor,
        }}
      >
        {startExecution ? "Start Execution" : "Next Cycle"}
      </Button>
      {/* <Button
        variant="contained"
        onClick={() => {
          handleClickTheme();
        }}
        sx={{
          position: "absolute",
          top: "8%",
          left: "62%",
          m: "auto",
          "& > :not(style)": { mt: 0, mx: 0 },
          width: "15%",
          "text-align": "center",
          border: "0px solid #eeeeee",
          "box-shadow": borderColor,
        }}
      >
        {"Change Theme"}
      </Button> */}
      <Draggable>
        <Box
          p={2}
          sx={{
            position: "absolute",
            top: "-4%",
            left: "18%",
            m: "auto",
            "& > :not(style)": { mt: 0, mx: 0 },
            my: "4%",
            height: "5%",
            "text-align": "center",
            "box-shadow": borderColor,
          }}
        >
          <Typography variant="h3" gutterBottom component="div">
            Current cycle: {Clock}
          </Typography>
        </Box>
      </Draggable>
      <div>
        {/*Check the format of the passed variables from the Inputspage  
            <h6 style={{ marginTop: 10 }}>{JSON.stringify(Instructions)}</h6>
            <h6 style={{ marginTop: 10 }}>{AddSubInstructionLatency}</h6>
            <h6 style={{ marginTop: 10 }}>{MulDivInstructionLatency}</h6>
            <h6 style={{ marginTop: 10 }}>{LoadInstructionLatency}</h6>
            <h6 style={{ marginTop: 10 }}>{StoreInstructionLatency}</h6> */}
      </div>
    </Box>
  );
}
export default SimulationPage;
