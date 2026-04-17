import { useState } from "react";
import { X, UploadCloud } from "lucide-react";

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
};

const SECTIONS = ["new-arrivals", "top-selling", "casual", "formal", "party", "gym"];

export default function AddProductModal({ isOpen, onClose, onSave }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("clothes");
  const [sections, setSections] = useState<string[]>([]);
  const [inStock, setInStock] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      name,
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      category,
      sections,
      inStock,
      brandNewFiles: files,
    });
    setIsSaving(false);
    onClose();
  };

  // ----- Stitch Minimalist Design System -----
  const theme = {
    bg: "#f9f9f9",
    surface: "#ffffff",
    inputBg: "#f2f4f4",
    textBold: "#2d3435",
    textSoft: "#596061",
    primary: "#5f5e5e",
    border: "#acb3b4",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", justifyContent: "center", alignItems: "center",
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      padding: "20px"
    }}>
      <div style={{
        background: theme.bg,
        width: "100%", maxWidth: "540px",
        height: "auto", maxHeight: "90vh", overflowY: "auto",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        position: "relative",
        animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, background: "rgba(249, 249, 249, 0.8)",
          backdropFilter: "blur(20px)", zIndex: 10,
          padding: "20px 24px", borderBottom: `1px solid ${theme.border}33`,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: theme.textBold, margin: 0 }}>Add New Product</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textSoft, cursor: "pointer", display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Basic Info */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: theme.textSoft, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Product Name
            </label>
            <input 
              placeholder="e.g., Slim Fit Linen Shirt"
              value={name} onChange={e => setName(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: "10px",
                background: theme.inputBg, border: "none", outline: "none",
                fontSize: "15px", color: theme.textBold
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: theme.textSoft, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Price (₹)</label>
              <input type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", background: theme.inputBg, border: "none", outline: "none", fontSize: "15px", color: theme.textBold }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: theme.textSoft, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Discount (%)</label>
              <input type="number" placeholder="Optional" value={discount} onChange={e => setDiscount(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", background: theme.inputBg, border: "none", outline: "none", fontSize: "15px", color: theme.textBold }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
             <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: theme.textSoft, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", background: theme.inputBg, border: `1px solid ${theme.border}44`, outline: "none", fontSize: "15px", color: theme.textBold, appearance: "none" }}>
                  <option value="clothes">Clothes</option>
                  <option value="phones">Phones</option>
                  <option value="footwear">Footwear</option>
                </select>
             </div>
          </div>

          {/* Image Upload Area */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: theme.textSoft, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product Images</label>
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              height: "140px", background: theme.surface,
              border: `2px dashed ${theme.border}66`, borderRadius: "12px",
              cursor: "pointer", transition: "all 0.2s ease"
            }}>
              <UploadCloud size={32} color={theme.textSoft} style={{ marginBottom: "8px" }} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: theme.textBold }}>Click to upload</span>
              <span style={{ fontSize: "12px", color: theme.textSoft, marginTop: "4px" }}>
                {files.length > 0 ? `${files.length} file(s) selected` : "PNG, JPG, up to 10MB"}
              </span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={e => {
                if (e.target.files) setFiles(Array.from(e.target.files));
              }} />
            </label>
          </div>

          {/* Sections Togglers */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: theme.textSoft, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sections</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {SECTIONS.map(s => {
                const active = sections.includes(s);
                return (
                  <button key={s} onClick={() => toggleSection(s)} style={{
                    padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 600,
                    background: active ? theme.primary : theme.inputBg,
                    color: active ? "#fff" : theme.textSoft,
                    border: "none", cursor: "pointer", transition: "all 0.2s"
                  }}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Settings */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <div style={{
                width: "44px", height: "24px", borderRadius: "999px",
                background: inStock ? theme.primary : theme.border, position: "relative", transition: "0.2s"
              }}>
                <div style={{
                  position: "absolute", top: "2px", left: inStock ? "22px" : "2px",
                  width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "0.2s"
                }} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 600, color: theme.textBold }}>Currently In Stock</span>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: "20px 24px", borderTop: `1px solid ${theme.border}33`,
          display: "flex", justifyContent: "flex-end", gap: "12px",
          background: "rgba(249, 249, 249, 0.9)", backdropFilter: "blur(10px)",
          borderRadius: "0 0 16px 16px"
        }}>
          <button onClick={onClose} style={{
            padding: "12px 24px", borderRadius: "999px", background: "none",
            border: "none", color: theme.textSoft, fontWeight: 700, fontSize: "14px", cursor: "pointer"
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving || !name} style={{
            padding: "12px 24px", borderRadius: "999px", 
            background: theme.primary, color: "#fff", 
            border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            opacity: (!name || isSaving) ? 0.6 : 1
          }}>
            {isSaving ? "Saving..." : "Create Product"}
          </button>
        </div>

      </div>
    </div>
  );
}
