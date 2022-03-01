import "./InputsPage.css";
import * as React from "react";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TextField from "@mui/material/TextField/TextField";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { Button, Grid} from "@mui/material";
import background1 from "../Background/Calm.jpg";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

function InputsPage() {
  const [instList, setInstList] = useState([{ Instruction: "" }]);
  const [memoryList, setMemoryList] = useState([
    { memoryAddress: "", value: "" },
  ]);
  const [expanded, setExpanded] = useState(false);
  const [InstructionField, setInstructionField] = useState("");
  const [MemoryAddressField, setMemoryAddressField] = useState("");
  const [ErrorMemoryAddressField, setErrorMemoryAddressField] = useState("");
  const [valueField, setValueField] = useState("");
  const [addSubInstructionLatency, setAddSubInstructionLatency] = useState("");
  const [checkAddSubInstructionLatency, setCheckAddSubInstructionLatency] =
    useState(0);
  const [mulInstructionLatency, setMulInstructionLatency] = useState("");
  const [divInstructionLatency, setDivInstructionLatency] = useState("");
  const [checkMulInstructionLatency, setCheckMulInstructionLatency] =
    useState(0);
  const [checkDivInstructionLatency, setCheckDivInstructionLatency] =
    useState(0);
  const [loadInstructionLatency, setLoadInstructionLatency] = useState("");
  const [checkLoadInstructionLatency, setCheckLoadInstructionLatency] =
    useState(0);
  const [storeInstructionLatency, setStoreInstructionLatency] = useState("");
  const [checkStoreInstructionLatency, setCheckStoreInstructionLatency] =
    useState(0);

  const handleInstChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...instList];
    list[index][name] = value.toUpperCase();
    setInstList(list);
  };

  const handleAddInstClick = () => {
    setInstList([...instList, { Instruction: "" }]);
  };

  const handleRemoveInstClick = (index) => {
    const list = [...instList];
    list.splice(index, 1);
    setInstList(list);
  };

  const handleMemChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...memoryList];
    list[index][name] = value;
    setMemoryList(list);
  };

  const handleAddMemClick = () => {
    setMemoryList([...memoryList, { memoryAddress: "", value: "" }]);
  };

  const handleRemoveMemClick = (index) => {
    const list = [...memoryList];
    list.splice(index, 1);
    setMemoryList(list);
  };

  const checkInputs = () => {
    for (let i = 0; i < instList.length; i++) {
      if (instList[i].Instruction === "") {
        setInstructionField("error");
        return;
      } else {
        setInstructionField("");
      }
      if (validateInput(instList[i].Instruction)) {
        setInstructionField("");
      } else {
        setInstructionField("error");
        return;
      }
    }
    if (addSubInstructionLatency === "") {
      setCheckAddSubInstructionLatency("");
      return;
    } else setCheckAddSubInstructionLatency(0);

    if (mulInstructionLatency === "") {
      setCheckMulInstructionLatency("");
      return;
    } else setCheckMulInstructionLatency(0);
    if (divInstructionLatency === "") {
      setCheckDivInstructionLatency("");
      return;
    } else setCheckDivInstructionLatency(0);

    if (loadInstructionLatency === "") {
      setCheckLoadInstructionLatency("");
      return;
    } else setCheckLoadInstructionLatency(0);

    if (storeInstructionLatency === "") {
      setCheckStoreInstructionLatency("");
      return;
    } else setCheckStoreInstructionLatency(0);

    for (let i = 0; i < memoryList.length; i++) {
      if (memoryList[i].memoryAddress === "") {
        setMemoryAddressField("error");
        return;
      } else if (isNaN(parseInt(memoryList[i].memoryAddress))) {
        setMemoryAddressField("error2");
        return;
      } else {
        setMemoryAddressField("");
      }

      if (memoryList[i].value === "") {
        setValueField("error");
        return;
      } else if (isNaN(parseInt(memoryList[i].value))) {
        setValueField("error2");
        return;
      } else {
        setValueField("");
      }
    }

    for (let i = 0; i < memoryList.length; i++) {
      for (let j = i + 1; j < memoryList.length; j++) {
        if (memoryList[i].memoryAddress === memoryList[j].memoryAddress) {
          setErrorMemoryAddressField("There are duplicate Memory Addresses");
          return;
        } else {
          setErrorMemoryAddressField("");
        }
      }
    }

    localStorage.setItem("Instructions", JSON.stringify(instList));
    let temp = memoryList.sort((a, b) =>
      a.memoryAddress > b.memoryAddress ? 1 : 0
    );
    localStorage.setItem("Memory", JSON.stringify(temp));
    localStorage.setItem("AddSubInstructionLatency", addSubInstructionLatency);
    localStorage.setItem("MulInstructionLatency", mulInstructionLatency);
    localStorage.setItem("DivInstructionLatency", divInstructionLatency);
    localStorage.setItem("LoadInstructionLatency", loadInstructionLatency);
    localStorage.setItem("StoreInstructionLatency", storeInstructionLatency);
    window.location.href = "/simulate";
  };

  const validateInput = (x) => {
    let s = x.toUpperCase().split(/[\s,]+/);
    if (s.length > 4 || s.length < 3) return false;
    if (s.length === 3) {
      if (s[0] === "L.D" || s[0] === "S.D") {
        return validateRegister(s[1]) && !isNaN(parseInt(s[2]));
      }
      return false;
    } else {
      const inst = s[0];
      if (
        inst === "ADD.D" ||
        inst === "SUB.D" ||
        inst === "MUL.D" ||
        inst === "DIV.D"
      ) {
        return (
          validateRegister(s[1]) &&
          validateRegister(s[2]) &&
          validateRegister(s[3])
        );
      }
      return false;
    }
  };
  const validateRegister = (s) => {
    if (s.length > 4 || s.length < 2) {
      return false;
    }
    if (s[0] !== "F") return false;
    return (
      !isNaN(parseInt(s.slice(1))) &&
      parseInt(parseInt(s.slice(1))) >= 0 &&
      parseInt(s.slice(1)) <= 31
    );
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  return (
    <Grid
      container
      justify="center"
      alignItems="center"
      direction="column"
      className="App-header"
      sx={{
        minHeight: "100%",
        position: "absolute",
        overflow: "auto",
        width: "100%",
        backgroundImage: `url(${background1})`,
        backgroundRepeat: "repeat-y",
      }}
    >
      <Card sx={{ maxWidth: 400, my: "1vh" }}>
        <CardHeader
          sx={{ textAlign: "center", backgroundColor: "#702963" }}
          title={
            <Typography variant="body" color={"white"}>
              Tomasulo Simulator
            </Typography>
          }
        />
        <CardMedia
          component="img"
          height="280"
          image="./Tomasulo.jpg"
          alt="Tomasulo"
        />
        <CardContent>
          <Typography variant="body2">
            Tomasulo's algorithm is a computer architecture hardware algorithm
            for dynamic scheduling of instructions that allows out-of-order
            execution and enables more efficient use of multiple execution
            units.
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ textAlign: "center" }}>
            <h4>Please fill in the fields below:</h4>
            {/* -----------------------------------------------Instructions--------------------------------------------- */}
            <h5>Instructions:</h5>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "left", marginBottom: "5%" }}
            >
              -Please write the instructions like the following example:
              &#13;(1)For Arthimetic and logical operations: ADD.D F1,F2,F3
              &#13;(2)For Load and Store operations: L.D F1,(Address)
            </Typography>
            {instList.map((x, i) => {
              return (
                <div className="box">
                  <Typography paragraph>
                    {"Instruction " + (i + 1) + ":"}
                  </Typography>
                  <TextField
                    name="Instruction"
                    label="Type your Instruction"
                    key={i}
                    variant="outlined"
                    required
                    inputProps={{ style: { textTransform: "uppercase" } }}
                    sx={{ marginLeft: "10%" }}
                    value={x.Instruction}
                    onChange={(e) => handleInstChange(e, i)}
                    error={InstructionField === "error"}
                    helperText={
                      InstructionField === "error"
                        ? "Please type your instruction"
                        : " "
                    }
                  />
                  <span>
                    {instList.length !== 1 && (
                      <IconButton
                        style={{ marginTop: "2%" }}
                        color="error"
                        aria-label="remove instructions"
                        component="span"
                        onClick={() => handleRemoveInstClick(i)}
                      >
                        <RemoveCircleIcon />
                      </IconButton>
                    )}
                    {instList.length - 1 === i && (
                      <IconButton
                        style={{ marginTop: "2%" }}
                        color="primary"
                        aria-label="Add instructions"
                        component="span"
                        onClick={handleAddInstClick}
                      >
                        <AddCircleIcon />
                      </IconButton>
                    )}
                  </span>
                </div>
              );
            })}
            <hr />
            {/* --------------------------------------------Instruction Latencies--------------------------------------------- */}
            <h5>Instruction Latencies:</h5>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "left", marginBottom: "5%" }}
            >
              -Please type a 0 in any unwanted Instruction Latency:
            </Typography>
            <Typography paragraph>Add and Sub Instruction Latency:</Typography>
            <TextField
              id="addInstructionLatency"
              label="Instruction Latency"
              variant="outlined"
              required
              onChange={(event) =>
                setAddSubInstructionLatency(event.target.value)
              }
              error={checkAddSubInstructionLatency === ""}
              helperText={
                checkAddSubInstructionLatency === ""
                  ? "Please type a value"
                  : " "
              }
            />
            <Typography paragraph>Mul Instruction Latency:</Typography>
            <TextField
              id="mulInstructionLatency"
              label="Instruction Latency"
              variant="outlined"
              required
              onChange={(event) => setMulInstructionLatency(event.target.value)}
              error={checkMulInstructionLatency === ""}
              helperText={
                checkMulInstructionLatency === "" ? "Please type a value" : " "
              }
            />
            <Typography paragraph>Div Instruction Latency:</Typography>
            <TextField
              id="divInstructionLatency"
              label="Instruction Latency"
              variant="outlined"
              required
              onChange={(event) => setDivInstructionLatency(event.target.value)}
              error={checkDivInstructionLatency === ""}
              helperText={
                checkDivInstructionLatency === "" ? "Please type a value" : " "
              }
            />
            <Typography paragraph>Load Instruction Latency:</Typography>
            <TextField
              id="loadInstructionLatency"
              label="Instruction Latency"
              variant="outlined"
              required
              onChange={(event) =>
                setLoadInstructionLatency(event.target.value)
              }
              error={checkLoadInstructionLatency === ""}
              helperText={
                checkLoadInstructionLatency === "" ? "Please type a value" : " "
              }
            />
            <Typography paragraph>Store Instruction Latency:</Typography>
            <TextField
              id="storeInstructionLatency"
              label="Instruction Latency"
              variant="outlined"
              required
              onChange={(event) =>
                setStoreInstructionLatency(event.target.value)
              }
              error={checkStoreInstructionLatency === ""}
              helperText={
                checkStoreInstructionLatency === ""
                  ? "Please type a value"
                  : " "
              }
            />
            <hr />
            {/* -----------------------------------------------Memory addresses and values------------------------------------- */}
            <h5>Memory addresses and values:</h5>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "left", marginBottom: "5%" }}
            >
              -Please specify the memory addresses you want to use and their
              corresponding values:
            </Typography>
            {memoryList.map((x, i) => {
              return (
                <div className="box">
                  <Typography paragraph>{"Memory Address:"}</Typography>
                  <TextField
                    name="memoryAddress"
                    label="Type your memory address"
                    key={i}
                    variant="outlined"
                    required
                    value={x.memoryAddress}
                    onChange={(e) => handleMemChange(e, i)}
                    error={
                      MemoryAddressField === "error" ||
                      MemoryAddressField === "error2"
                    }
                    helperText={
                      MemoryAddressField === "error"
                        ? "Please type your memory address"
                        : MemoryAddressField === "error2"
                        ? "Please type a number"
                        : ""
                    }
                  />
                  <Typography paragraph>{"Value:"}</Typography>
                  <TextField
                    name="value"
                    label="Type its value"
                    key={i}
                    variant="outlined"
                    required
                    sx={{ marginLeft: "10%" }}
                    value={x.value}
                    onChange={(e) => handleMemChange(e, i)}
                    error={valueField === "error" || valueField === "error2"}
                    helperText={
                      valueField === "error"
                        ? "Please type its value"
                        : valueField === "error2"
                        ? "Please type a number"
                        : ""
                    }
                  />
                  <span>
                    {memoryList.length !== 1 && (
                      <IconButton
                        style={{ marginTop: "2%" }}
                        color="error"
                        aria-label="remove memory address"
                        component="span"
                        onClick={() => handleRemoveMemClick(i)}
                      >
                        <RemoveCircleIcon />
                      </IconButton>
                    )}
                    {memoryList.length - 1 === i && (
                      <IconButton
                        style={{ marginTop: "2%" }}
                        color="primary"
                        aria-label="Add memory address"
                        component="span"
                        onClick={handleAddMemClick}
                      >
                        <AddCircleIcon />
                      </IconButton>
                    )}
                  </span>
                </div>
              );
            })}
            <Typography variant="body2" sx={{ color: "red" }}>
              {ErrorMemoryAddressField}
            </Typography>
            <br />
            <Button variant="contained" onClick={checkInputs} color="secondary">
              Simulate
            </Button>
          </CardContent>
        </Collapse>
      </Card>
    </Grid>
  );
}

export default InputsPage;
