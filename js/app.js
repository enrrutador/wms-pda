const { useState, useEffect, useRef } = React;

function WMSApp() {
  const [screen, setScreen] = useState("login");
  const [pin, setPin] = useState("");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const p = localStorage.getItem("wms_products");
    const l = localStorage.getItem("wms_logs");

    if (p) setProducts(JSON.parse(p));
    else {
      const demo = [
        { sku: "A001", name: "Laptop Dell", cat: "Tech", stock: 50, min: 10, loc: "A-01" },
        { sku: "B002", name: "Mouse Logitech", cat: "Tech", stock: 5, min: 15, loc: "B-02" },
        { sku: "C003", name: "Teclado HP", cat: "Tech", stock: 100, min: 20, loc: "C-03" }
      ];
      setProducts(demo);
      localStorage.setItem("wms_products", JSON.stringify(demo));
    }

    if (l) setLogs(JSON.parse(l));
  }, []);

  const saveProducts = (p) => {
    setProducts(p);
    localStorage.setItem("wms_products", JSON.stringify(p));
  };

  const addLog = (log) => {
    const newLogs = [log, ...logs];
    setLogs(newLogs);
    localStorage.setItem("wms_logs", JSON.stringify(newLogs));
  };

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 2000);
  };

  const handleLogin = (p) => {
    if (p === "1234") setUser({ name: "Admin", role: "admin" });
    else if (p === "5678") setUser({ name: "Operator", role: "op" });
    else return showAlert("PIN incorrecto", "error");
    setPin("");
    setScreen("dash");
  };

  const handlePinInput = (d) => {
    const np = pin + d;
    setPin(np);
    if (np.length === 4) handleLogin(np);
  };

  const handleScan = (sku) => {
    const prod = products.find(p => p.sku === sku);
    if (prod) {
      setSelectedProduct(prod);
      setScreen("qty");
      if (prod.stock <= prod.min) showAlert("Stock crítico", "warn");
    } else {
      setSelectedProduct({ sku, isNew: true });
      setScreen("new");
    }
  };

  const handleUpdate = (type) => {
    if (type === "out" && qty > selectedProduct.stock)
      return showAlert("Stock insuficiente", "error");

    const delta = type === "in" ? qty : -qty;
    const updated = products.map(p =>
      p.sku === selectedProduct.sku
        ? { ...p, stock: p.stock + delta }
        : p
    );

    saveProducts(updated);
    addLog({
      user: user.name,
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      type,
      qty,
      time: new Date().toLocaleString()
    });

    setQty(1);
    setSelectedProduct(null);
    setScreen("dash");
    showAlert("Actualizado");
  };

  if (screen === "login") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-8">📦 WMS PDA</h1>

        <div className="flex gap-3 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-5 h-5 rounded-full border ${pin.length > i ? "bg-green-500" : "border-gray-500"}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6,7,8,9,"",0,"C"].map((n,i)=>(
            <button
              key={i}
              onClick={()=>{
                if (n === "C") setPin("");
                else if (n !== "") handlePinInput(n.toString());
              }}
              className={`h-16 w-16 rounded-xl text-2xl font-bold ${
                n === "C" ? "bg-red-700" : n === "" ? "invisible" : "bg-gray-800"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <p className="text-gray-500 mt-8">Demo: 1234 / 5678</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {alert && (
        <div className={`fixed top-0 left-0 right-0 p-4 text-center font-bold z-50 ${
          alert.type === "error" ? "bg-red-600" :
          alert.type === "warn" ? "bg-yellow-600" : "bg-green-600"
        }`}>
          {alert.msg}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">{user.name}</h2>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setScreen("scan")} className="bg-green-600 p-8 rounded-xl">📷 Escanear</button>
        <button onClick={() => setScreen("search")} className="bg-blue-600 p-8 rounded-xl">🔍 Buscar</button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<WMSApp />);
