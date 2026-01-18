const { useState, useEffect, useRef } = React;

function App() {
  const [screen, setScreen] = useState("login");
  const [pin, setPin] = useState("");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [alert, setAlert] = useState(null);
  const [manualSku, setManualSku] = useState("");

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem("wms_products")) || [
      { sku:"A001", name:"Laptop Dell", stock:10, min:3, loc:"A-01" },
      { sku:"B002", name:"Mouse Logitech", stock:5, min:10, loc:"B-02" }
    ];
    setProducts(p);

    const l = JSON.parse(localStorage.getItem("wms_logs")) || [];
    setLogs(l);
  }, []);

  const saveProducts = p => {
    setProducts(p);
    localStorage.setItem("wms_products", JSON.stringify(p));
  };

  const saveLogs = l => {
    setLogs(l);
    localStorage.setItem("wms_logs", JSON.stringify(l));
  };

  const show = (msg, type="ok") => {
    setAlert({msg,type});
    setTimeout(()=>setAlert(null),2000);
  };

  const login = p => {
    if (p === "1234") {
      setUser({name:"Admin", role:"admin"});
      setScreen("dash");
    } else if (p === "5678") {
      setUser({name:"Operador", role:"op"});
      setScreen("dash");
    } else {
      show("PIN incorrecto","error");
    }
    setPin("");
  };

  const updateStock = type => {
    const delta = type === "in" ? qty : -qty;

    const updated = products.map(p =>
      p.sku === selected.sku
        ? {...p, stock:p.stock + delta}
        : p
    );

    saveProducts(updated);

    const log = {
      time: new Date().toLocaleString(),
      user: user.name,
      sku: selected.sku,
      name: selected.name,
      qty,
      type
    };

    saveLogs([log, ...logs]);

    setQty(1);
    setSelected(null);
    setScreen("dash");
    show("Stock actualizado");
  };

  const handleScan = sku => {
    const p = products.find(x => x.sku === sku);
    if (p) {
      setSelected(p);
      setScreen("qty");
    } else {
      show("Producto no existe","error");
    }
    setManualSku("");
  };

  const exportCSV = () => {
    let csv = "Fecha,Usuario,SKU,Producto,Tipo,Cantidad\n";
    logs.forEach(l=>{
      csv += `${l.time},${l.user},${l.sku},${l.name},${l.type},${l.qty}\n`;
    });

    const blob = new Blob([csv], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "reporte.csv";
    a.click();
  };

  /* ---------- SCREENS ---------- */

  if (screen === "login") {
    return React.createElement("div",{style:{padding:40,textAlign:"center"}},
      React.createElement("h1",null,"WMS PDA"),
      React.createElement("input",{
        type:"password",
        placeholder:"PIN",
        value:pin,
        onChange:e=>{
          setPin(e.target.value);
          if (e.target.value.length===4) login(e.target.value);
        }
      }),
      React.createElement("p",null,"Demo: 1234 / 5678")
    );
  }

  if (screen === "dash") {
    return React.createElement("div",{style:{padding:20}},
      alert && React.createElement("div",{style:{background:"green"}},alert.msg),
      React.createElement("h2",null,"Usuario: ",user.name),

      React.createElement("button",{onClick:()=>setScreen("scan")},"Escanear / Manual"),
      React.createElement("button",{onClick:()=>setScreen("history")},"Historial"),
      React.createElement("button",{onClick:exportCSV},"Exportar CSV"),
      React.createElement("button",{onClick:()=>{setUser(null);setScreen("login");}},"Salir")
    );
  }

  if (screen === "scan") {
    return React.createElement("div",{style:{padding:20}},
      React.createElement("h2",null,"Ingreso Manual SKU"),
      React.createElement("input",{
        value:manualSku,
        onChange:e=>setManualSku(e.target.value)
      }),
      React.createElement("button",{onClick:()=>handleScan(manualSku)},"Confirmar"),
      React.createElement("button",{onClick:()=>setScreen("dash")},"Volver")
    );
  }

  if (screen === "qty") {
    return React.createElement("div",{style:{padding:20}},
      React.createElement("h2",null,selected.name),
      React.createElement("p",null,"Stock: ",selected.stock),
      React.createElement("input",{
        type:"number",
        value:qty,
        onChange:e=>setQty(+e.target.value || 1)
      }),
      React.createElement("button",{onClick:()=>updateStock("in")},"Entrada"),
      React.createElement("button",{onClick:()=>updateStock("out")},"Salida"),
      React.createElement("button",{onClick:()=>setScreen("dash")},"Cancelar")
    );
  }

  if (screen === "history") {
    return React.createElement("div",{style:{padding:20}},
      React.createElement("h2",null,"Historial"),
      logs.map((l,i)=>
        React.createElement("div",{key:i},
          l.time," - ",l.sku," - ",l.type," - ",l.qty
        )
      ),
      React.createElement("button",{onClick:()=>setScreen("dash")},"Volver")
    );
  }
}

ReactDOM.createRoot(document.getElementById("root"))
  .render(React.createElement(App));
