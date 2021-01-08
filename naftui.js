/*******************************************************************************
 * NAFTUI - No Acryonym For This User Interface.
 * VERSION 0.1 - See LICENSE.
 ******************************************************************************/

var naftui = {}; $ = naftui;

$._generateId = function () {
  return "_" + Date.now().toString(36) +
    Math.random().toString(36).substr(2, 9);
}

$._validateParameters = function (param, expectedType, expectedProps) {
  // to be continued
}

$._Component = class {

  get id() { return this.node.id; }

  set visible(isVisible) {
    if (isVisible === true) {
      this.node.style.display = ''; // returns to the default value in CSS.
    } else {
      this.node.style.display = 'none';
    }
  }

  constructor(elementType, properties = undefined) {
    if (properties === undefined) properties = {};
    this.node = document.createElement(elementType);
    this._components = [];
    this.additionalClasses = properties.additionalClasses !== undefined ?
      properties.additionalClasses : [];
    this.originalProperties = properties;
    this.node.id = $._generateId();

    for (let i = 0; i = this.additionalClasses.length; i++)
      this.node.classList.add(this.additionalClasses[i]);
    this._bindTo = "";
    this.onAdded = function () { };
    this.visible = properties.visible !== undefined ? properties.visible : true;
  }

  addComponent(component) {
    // TODO: add validation.
    this.node.appendChild(component.node);
    this._components.push(component);
    component.naftuiParent = this;
    component.onAdded(this);
  }

  addComponents(components) {
    for (let i = 0; i < components.length; i++)
      this.addComponent(components[i]);
  }

  removeComponent(component) {
    this.node.removeChild(component.node);
    var i;
    for (i = 0; i < this._components.length; i++)
      if (this._components[i] === component) break;
    this._components.splice(i, 1);
  }
}

$.AppContainer = class extends $._Component {
  constructor(properties = undefined) {
    super("div", properties);
    if (properties === undefined) properties = {};
    this.appName = properties.appName !== undefined ? properties.appName :
      "New Application";
    this.node.classList.add('app-container');
    document.body.append(this.node);
  }

}

$.ContentBlock = class extends $._Component {
  get text() { return this.node.textContent }
  set text(value) { this.node.textContent = value; }
  constructor(properties = undefined) {
    super("div", properties);
    if (properties === undefined) properties = {};
    this.text = properties.text !== undefined ? properties.text :
      "";
    this._bindTo = "text";
  }
}

$.ContentGrid = class extends $._Component {
  constructor(properties = undefined) {
    super("div", properties);
    if (properties === undefined) properties = {};
    this.node.classList.add('content-grid');
    this.rows = [];
  }
}

$.GridColumn = class extends $._Component {
  constructor(properties = undefined) {
    super("div", properties);
    if (properties === undefined) properties = {};
    this.node.classList.add('grid-column');
  }
}

$.GridRow = class extends $._Component {
  constructor(properties = undefined) {
    super("div", properties);
    if (properties === undefined) properties = {};
    this.node.classList.add('grid-row');
    this.columns = [];
  }
}

$.Window = class extends $._Component {
  /* 
    TODO:
    Reset functions
        - 1 must reset to the original values of the window.
        - 1 must reset the initial values of all components (inputs).
  */

  get x() { return this.node.style.top; }
  get y() { return this.node.style.left; }
  get w() { return this.node.style.width; }
  get h() { return this.node.style.height; }

  set x(val) {
    if (this.mode == "manual") {
      this._x = val;
      this.node.style.top = this._x;
    } else {
      console.error(
        "X coordinate incompatible with the current window mode."
      );
    }
  }

  set y(val) {
    if (this.mode == "manual") {
      this._y = val;
      this.node.style.left = this._y;
    } else {
      console.error(
        "Y coordinate incompatible with the current window mode."
      );
    }
  }

  get showWindowBar() {
    return this._showWindowBar;
  }

  set showWindowBar(value) {
    this._showWindowBar = value;
    this.windowBar.visible = value;
  }

  constructor(properties = undefined) {
    super("div", properties);
    if (properties === undefined) properties = {};
    this.title = properties.title !== undefined ? properties.title :
      "New Window";
    this.mode = properties.mode !== undefined ? properties.mode : "manual";
    // Correct me : default value conflicts with rule about coordinates and 
    // size.
    this._x = properties.x !== undefined ? properties.x : "120px";
    this._y = properties.y !== undefined ? properties.y : "120px";
    this._w = properties.w !== undefined ? properties.w : "120px";
    this._h = properties.h !== undefined ? properties.h : "120px";
    // Correct me
    this.windowType = properties.windowType !== undefined ?
      properties.windowType : "regular";
    this.filePath = properties.filePath !== undefined ? properties.filePath :
      "";
    this.modified = false;
    this.quitConfirm = true;

    this.node.classList.add('window');
    this.node.naftuiOrigin = this;
    this.windowBar = properties.windowBar === undefined ? new $.WindowBar({ text: this.title, window: this }) : properties.windowBar;
    this.showWindowBar = properties.showWindowBar !== undefined ?
      properties.showWindowBar : true;

    this.fn = properties.fn !== undefined ? properties.fn : {};

    // this will prevent user selection
    this.node.addEventListener("selectstart", function () {
      event.preventDefault();
      return false;
    }, false);

    if (this.mode == "manual") {
      this.node.style.top = this._x;
      this.node.style.left = this._y;
      this.node.style.width = this._w;
      this.node.style.height = this._h;
    }
    else if (this.mode == "fullbody") {
      this.node.style.top = "0";
      this.node.style.left = "0";
      this.node.style.width = "100%";
      this.node.style.height = "100%";
      this.node.classList.add('fullbody');
    }
    else if (this.mode == "centered") {
      this.node.style.top = "50%";
      this.node.style.left = "50%";
      this.node.style.width = this._w;
      this.node.style.height = this._h;
      this.node.style.transform = "translate(-50%, -50%)";
    }

    this.node.style.display = 'block';

  }
}

$.WindowBar = class {
  constructor(properties = undefined) {
    if (properties === undefined) properties = {};
    this.node = document.createElement("div");
    this.node.classList.add('window-bar');

    this.text = properties.text !== undefined ? properties.text : "";
    this.window = properties.window;
    this.minimize = properties.minimize !== undefined ? properties.minimize :
      true;
    this.maximize = properties.maximize !== undefined ? properties.maximize :
      true;
    this.close = properties.close !== undefined ? properties.close : true;

    var icons = document.createElement("span");
    icons.classList.add('icons');
    this.node.appendChild(icons);

    var titleNode = document.createElement("span");
    titleNode.classList.add('title');
    titleNode.appendChild(document.createTextNode(this.text));
    this.node.appendChild(titleNode);

    if (this.close == true) {
      var closeNode = document.createElement('span');
      var icon = document.createTextNode('🗙');
      closeNode.appendChild(icon);
      closeNode.naftuiOrigin = this;
      closeNode.onclick = function (event) {
        // TODO : ajouter un message de confirmation.
        this.naftuiOrigin.window.naftuiParent.removeComponent(
          this.naftuiOrigin.window
        );
        // Reset components
      };
      icons.appendChild(closeNode);
    }

    this.window.node.appendChild(this.node);
  }

  set visible(isVisible) {
    if (isVisible === true) {
      this.node.style.display = ''; // returns to the default value in CSS.
    } else {
      this.node.style.display = 'none';
    }
  }
}

$.Field = class extends $._Component {

  get dataType() { return this._dataType; }

  set dataType(val) {
    var possibleValues = ["text", "number", "file", "phone", "email",
      "custom-rule", "hidden", "date", "password"];
    if (!possibleValues.includes(val)) {
      console.warn(
        "Unknown dataType. Default or previous value will be used instead.");
      return;
    }

    switch (val) {
      case "text":
        this.node.type = "text";
        break;
      case "password":
        this.node.type = "password";
        break;
      case "number":
        this.node.type = "number";
        this.mask = undefined;
        break;
      case "file":
        this.node.type = "file";
        this.mask = undefined;
        break;
      case "phone":
        this.node.type = "text";
        this.mask = undefined;
        break;
      case "email":
        this.node.type = "email";
        this.mask = undefined;
        break;
      case "custom-rule":
        this.node.type = "text";
        break;
      case "hidden":
        this.node.type = "hidden";
        break;
      case "date":
        this.node.type = "date";
        this.mask = undefined;
        break;
    }
    this._dataType = val;
  }

  get length() { return this._length; }

  set length(val) {

    if (Number(val) === NaN && val !== 'max') {
      console.error("Length must be a number positive number or 'max'");
      return;
    }

    this.node.maxLength = val == 'max' ? $.settings.maxInputLength :
      Number(val);
    this._length = this.node.maxLength;
  }

  set value(val) {
    // Add validation rules
    this._value = val;
    this.node.value = val;
  }

  get value() {
    return this._dataType == "number" ? Number(this._value) :
      this.uppercase ? this._value.toUpperCase() : this._value;
  }

  set mask(val) {
    if (val === undefined) {
      this._mask = undefined;
      return;
    }
    if (!["text", "custom-rule", "hidden"].includes(this._type)) {
      console.error(
        "Masks are only compatible with the following Field types : text, " +
        "custom-rule, hidden."
      );
      return;
    }

    this._mask = val;
  }

  get mask() { return this._mask; }

  set disabled(bool) { this.node.disabled = bool; }
  get disabled() { return this.node.disabled; }

  set readonly(bool) { this.node.readOnly = bool; }
  get readonly() { return this.node.readOnly; }

  set uppercase(bool) { this.node.classList[(bool ? "add" : "remove")]('uppercase'); this._uppercase = bool; }
  get uppercase() { return this._uppercase; }
  
  constructor(properties) {
    if (properties === undefined) properties = {};
    super("input", properties);
    this.dataBindName = properties.dataBindName !== undefined ?
      properties.dataBindName : "";
    this.dataType = properties.dataType !== undefined ? properties.dataType :
      "text";
    this.value = properties.value !== undefined ? properties.value : "";
    this.length = properties.length !== undefined ? properties.length : "max";
    this.format = properties.format !== undefined ? properties.length :
      undefined;
    this.customRule = properties.format !== undefined ? properties.customRule :
      undefined;
    this.mask = properties.mask !== undefined ? properties.mask : undefined;
    this.node.placeholder = properties.placeholder !== undefined ?
      properties.placeholder : "";
    this._bindTo = "value";
    this.readonly = properties.readonly !== undefined ? properties.readonly : false;
    this.disabled = properties.disabled !== undefined ? properties.disabled : false;
    this.uppercase = properties.uppercase !== undefined ? properties.uppercase : false;

    let obj = this;
    this.node.onchange = function () {
      obj.value = this.value;
    }
  }

  generateLabel(text) { return new $.Label({ text: text, for: this.id }); }

}

$.Dropdown = class extends $._Component {
  get dataType() { return this._dataType }

  set dataType(value) {
    if (value !== "number" && value !== "text") {
      console.warn("Unrecognized dataType. Text used instead.");
      value = "text";
    }
    this._dataType = value;
  }

  get value() {
    return this.dataType == "number" ? Number(this.node.value) :
      this.node.value;
  }

  set value(val) {
    this.node.value = val;
  }

  constructor(properties) {
    if (properties === undefined) properties = {};
    super("select", properties);
    this.dataBindName = properties.dataBindName !== undefined ?
      properties.dataBindName : "";
    this.dataType = properties.dataType !== undefined ? properties.dataType :
      "text";

    this.node.onchange = function () {
      obj.value = this.value;
    }

    this._bindTo = "value";
  }

  addOption(text, value) {
    let option = document.createElement('option');
    option.appendChild(document.createTextNode(text));
    option.value = value;
    this.node.appendChild(option);
  }

  generateLabel(text) { return new $.Label({ text: text, for: this.id }); }
}

$.Label = class extends $._Component {

  set text(value) { this.node.textContent = value; }

  get text() { return this.node.textContent; }

  constructor(properties) {
    if (properties === undefined) properties = {};
    super("label", properties);
    this.text = properties.text !== undefined ? properties.text : "Label";
    this.node.htmlFor = properties.for !== undefined ? properties.for : "";
    this._bindTo = "text";
  }
}

$.Button = class extends $._Component {

  constructor(properties) {
    if (properties === undefined) properties = {};
    super("button", properties);

    this.node.onclick = function () { };
    this.text = properties.text === undefined ? "button" : properties.text;
    this.disabled = properties.disabled !== undefined ? properties.disabled :
      false;
  }

  set text(value) { this.node.textContent = value; }
  get text() { return this.node.textContent; }

  set disabled(value) { this.node.disabled = value; }
  get disabled() { return this.node.disabled }

}

$.Image = class extends $._Component {

  // todo : autres propriétés.

  get src() { return this.node.src; }
  set src(value) { this.node.src = value; }

  get w() { return this.node.style.width; }
  set w(value) { this.node.style.width = value; }

  get h() { return this.node.style.height; }
  set h(value) { this.node.style.height = value; }

  constructor(properties) {
    if (properties === undefined) properties = {};
    super("img", properties);

    this.src = properties.src !== undefined ? properties.src : "";
    this.w = properties.w !== undefined ? properties.w : "";
    this.h = properties.wh !== undefined ? properties.h : "";
    this._bindTo = "src";
  }
}

$.DataBinder = class {
  constructor(properties) {
    if (properties === undefined) properties = {};
    this._bindRules = [];
    this._bindTo = "data";
  }

  get data() {
    if (this._bindRules.length < 1) {
      console.error("DataBinder has not been bound");
      return;
    }
    let dataX = {}
    for (let i = 0; i < this._bindRules.length; i++) {
      let bindRule = this._bindRules[i];
      dataX[bindRule.name] = bindRule.boundObject._bindTo === "" ?
        null : bindRule.boundObject[bindRule.boundObject._bindTo];
    }
    return this._isArray ? Object.values(dataX) : dataX;
  }

  set data(dataX) {
    if (this._bindRules.length < 1) {
      console.error("There  are no bindRules.");
      return;
    }
    this._isArray = dataX.constructor == Array;
    for (let i = 0; i < this._bindRules.length; i++) {
      let bindRule = this._bindRules[i];
      if (bindRule.boundObject._bindTo == "") {
        console.warn(
          "This object has no bindable property. It will be skipped."
        );
        continue;
      }
      if (dataX[bindRule.name] === undefined) continue;
      bindRule.boundObject[bindRule.boundObject._bindTo] =
        dataX[bindRule.name];
    }
  }

  bind(bindRules) {
    this._bindRules = bindRules;
  }

}

$.DataPipe = class {
  constructor(properties) {
    if (properties === undefined) properties = {};
    this._parentPipeline = undefined;
    this._parentPipelineIndex = -1;
    this.boundProcess = function (data) { return data }
    this._stopped = false;
  }

  stop() {
    this._stopped = true;
  }

  process(input) {
    let output = this.boundProcess(input);
    let n = this._parentPipelineIndex + 1;
    if (n <= this._parentPipeline._line.length - 1 && this._stopped == false)
      this._parentPipeline._line[n].process(output);
    this._stopped = false;
  }
}

$.DataRequest = class extends $.DataPipe {
  constructor(properties) {
    if (properties === undefined) properties = {};
    super();
    this.boundProcess = function (data) { };
    this.requestType = properties.requestType !== undefined ?
      properties.requestType : "get";
    this.requestPath = properties.requestPath !== undefined ?
      properties.requestPath : "/";
  }

  process(input = undefined) {
    const xhr = new XMLHttpRequest();
    let self = this;

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status !== 200 && xhr.readyState !== 304) {
          console.error(
            'An error occured while trying to access resource "' +
            self.requestPath + '" using ' + self.requestType + ' method.'
          );
          return;
        }

        let output = JSON.parse(xhr.responseText);
        let n = self._parentPipelineIndex + 1;
        if (n <= self._parentPipeline._line.length - 1) {
          self._parentPipeline._line[n].process(output);
        }
      }
    }

    xhr.open(this.requestType, this.requestPath);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (this.requestType.toUpperCase() == "GET") xhr.send();
    else xhr.send(JSON.stringify(input));
  }
}

$.DataPipeline = class {
  constructor() {
    this._line = [];
  }
  addPipe(pipe) {
    pipe._parentPipelineIndex = this._line.push(pipe) - 1;
    pipe._parentPipeline = this;
  }
}

$.Column = class extends $._Component {

  get value() {
    return this._colType == "column" ? this.node.textContent :
      this._field.value;
  };
  set value(val) {
    if (this._colType == "column") {
      this.node.textContent = val;
    } else {
      this._field.value = val;
    }
  };

  constructor(properties) {
    if (properties === undefined) properties = {};
    super("td", properties);
    this._bindTo = "value";
    this._colType = properties.colType === undefined ? "column" :
      properties.colType;

    if (this._colType != "column") {
      this._field = new $.Field({ dataType: this._colType });
      this.addComponent(this._field);
    }
  }
}

$.Row = class extends $._Component {

  get definition() {
    return this._definition;
  }

  set definition(value) {
    if (this.columns.length > 0) {
      console.error(
        "Impossible to change the table definition while the table contains " +
        "lines."
      );
      return;
    }
    this._definition = value;
  }

  get data() {
    return this._dataBinder.data;
  }

  set data(value) {
    this._dataBinder.data = value;
  }

  constructor(properties) {
    if (properties === undefined) properties = {};
    super("tr", properties);
    this.columns = {};
    this.definition = properties.definition !== undefined ?
      properties.definition : {};
    this._dataBinder = new $.DataBinder();
    this._bindTo = "data";

    for (let i = 0; i < this._definition.length; i++) {
      let definition = this._definition[i];
      let colType = "column";
      let name = "";

      if (definition.constructor === Object) {
        colType = definition.colType !== undefined ? definition.colType :
          colType;
        name = definition.name
      }

      name = name == "" ? this._definition[i] : definition.name;
      this.newColumn(name, colType);
    }
  }


  newColumn(name, colType) {
    let col = new $.Column({ "colType": colType });
    this.addComponent(col);
    this.columns[name] = col;

    this._dataBinder._bindRules.push({ "name": name, "boundObject": col });
  }
}

$.Table = class extends $._Component {

  get definition() {
    return this._definition;
  }
  set definition(value) {
    if (this.rows.length > 0) {
      console.error(
        "Impossible to change the table definition while the table contains " +
        "lines."
      );
      return;
    }
    this._definition = value;
  }

  get data() {
    return this._dataBinder._bindRules.length > 0 ? this._dataBinder.data : [];
  }

  set data(value) {
    if (value.constructor !== Array) {
      console.error("Data must be an array.");
      return;
    }
    if (this._definition === undefined) {
      console.error("Cannot fill a table without a table definition.");
      return;
    }


    if (value.length > this.rows.length) {
      for (let i = this.rows.length; i < value.length; i++) {
        this.newRow();
      }
    }
    this._dataBinder.data = value;
    this.onupdate();
  }

  constructor(properties) {
    if (properties === undefined) properties = {};
    super("table", properties);
    this.rows = [];
    this.definition = properties.definiton !== undefined ? properties.definition
      : {};
    this.useGroups = properties.useGroups !== undefined ? properties.useGroupes
      : false;
    this._dataBinder = new $.DataBinder();
    this._bindTo = "data";

    if (properties.header !== undefined) {
      let header = new $._Component("thead");
      this.addComponent(header);
      header.addComponent(new $._Component("tr"));

      for (let i = 0; i < properties.header.length; i++) {
        let col = new $._Component("th");
        col.node.textContent = properties.header[i];
        header._components[0].addComponent(col);
      }
    }
    this.onupdate = function () { };
    this.tbody = new $._Component("tbody");
    this.addComponent(this.tbody);
  }

  newRow() {
    let row = new $.Row({ definition: this.definition });
    this.tbody.addComponent(row);
    this.rows.push(row);

    this._dataBinder._bindRules.push({
      "name": this.rows.length - 1,
      "boundObject": row
    });
  }
}

$.Canvas = class extends $._Component {

  get w() { return this.node.width; }
  set w(val) { this.node.width = val; }

  get h() { return this.node.height; }
  set h(val) { this.node.height = val; }

  constructor(properties) {
    if (properties === undefined) properties = {};
    super("canvas", properties);

    this.w = properties.w !== undefined ? properties.w : 0;
    this.h = properties.h !== undefined ? properties.h : 0;
  }
}

$.Video = class extends $._Component {

  get w() { return this.node.width; }
  set w(val) { this.node.width = val; }

  get h() { return this.node.height; }
  set h(val) { this.node.height = val; }

  constructor(properties) {
    if (properties === undefined) properties = {};
    super("video", properties);

    this.w = properties.w !== undefined ? properties.w : 0;
    this.h = properties.h !== undefined ? properties.h : 0;
    this.useVideo = properties.useVideo !== undefined ? properties.useVideo : true;
    this.useAudio = properties.useAudio !== undefined ? properties.useAudio : true;
    this.node.autoplay = properties.autoplay !== undefined ? properties.autoplay : false;
  }

  startStream() {
    if (!navigator.mediaDevices) {
      console.error('The mediaDevices API is not supported by your browser.');
      return;
    } else {
      let self = this;
      navigator.mediaDevices.getUserMedia({ video: self.useVideo, audio: self.useAudio })
        .then(function (stream) {
          self._stream = stream;
          console.log(self);
          self.node.srcObject = stream;
        }).catch(function (error) {
          console.error(error);
        });
    }
  }

  stopStream() {
    if (this._stream === undefined) {
      console.warn('No stream to stop');
      return;
    }
    this._stream.getTracks().forEach(track => track.stop());
    this._stream = undefined;

  }
}

$.settings = { maxInputLength: 256 };