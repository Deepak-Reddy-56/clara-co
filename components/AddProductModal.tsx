import { useState } from "react";
import { X, UploadCloud, ChevronDown } from "lucide-react";

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
  availableSections?: string[];
};

const SECTIONS = ["new-arrivals", "top-selling", "casual", "formal", "party", "gym"];

export default function AddProductModal({ isOpen, onClose, onSave, availableSections }: AddProductModalProps) {
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

  // ----- Stitch Minimalist Design System (Contrast Optimizations) -----
  const theme = {
    bg: "#f8fafc",          // slate-50
    surface: "#ffffff",     // card/modal background
    inputBg: "#f1f5f9",     // slate-100 inputs background
    textBold: "#0f172a",    // slate-900 high contrast bold text
    textSoft: "#334155",    // slate-700 readable secondary text
    primary: "#0f172a",     // primary black brand color
    border: "#cbd5e1",      // slate-300 border
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", justifyContent: "center", alignItems: "center",
      background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)",
      padding: "16px"
    }}>
      <div style={{
        background: theme.bg,
        width: "100%", maxWidth: "500px",
        height: "auto", maxHeight: "85vh", overflowY: "auto",
        borderRadius: "20px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}>
        
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, background: "rgba(248, 250, 252, 0.9)",
          backdropFilter: "blur(20px)", zIndex: 10,
          padding: "18px 24px", borderBottom: `1px solid ${theme.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: theme.textBold, margin: 0, letterSpacing: "-0.01em" }}>Add New Product</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textSoft, cursor: "pointer", display: "flex", padding: "6px" }}>
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          
          {/* Product Name */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: theme.textSoft, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Product Name
            </label>
            <input 
              placeholder="e.g., Slim Fit Linen Shirt"
              value={name} onChange={e => setName(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "8px",
                background: theme.inputBg, border: `1px solid ${theme.border}`, outline: "none",
                fontSize: "14px", color: theme.textBold, boxSizing: "border-box"
              }}
            />
          </div>

          {/* Price & Discount */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: theme.textSoft, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Price (₹)</label>
              <input type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", background: theme.inputBg, border: `1px solid ${theme.border}`, outline: "none", fontSize: "14px", color: theme.textBold, boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: theme.textSoft, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Discount (%)</label>
              <input type="number" placeholder="Optional" value={discount} onChange={e => setDiscount(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", background: theme.inputBg, border: `1px solid ${theme.border}`, outline: "none", fontSize: "14px", color: theme.textBold, boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Category with Chevron arrow */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: theme.textSoft, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</label>
            <div style={{ position: "relative", width: "100%" }}>
              <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", paddingRight: "36px", borderRadius: "8px", background: theme.inputBg, border: `1px solid ${theme.border}`, outline: "none", fontSize: "14px", color: theme.textBold, appearance: "none", boxSizing: "border-box" }}>
                <option value="clothes">Clothes</option>
                <option value="goggles">Goggles</option>
                <option value="perfumes">Perfumes</option>
              </select>
              <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex", color: theme.textSoft }}>
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Image Upload Area with File Previews */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: theme.textSoft, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Product Images</label>
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              height: "120px", background: theme.surface,
              border: `2px dashed ${theme.border}`, borderRadius: "12px",
              cursor: "pointer", transition: "all 0.2s ease", boxSizing: "border-box"
            }}>
              <UploadCloud size={28} color={theme.textSoft} style={{ marginBottom: "6px" }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: theme.textBold }}>Click to upload</span>
              <span style={{ fontSize: "11px", color: theme.textSoft, marginTop: "2px" }}>
                PNG, JPG, up to 10MB
              </span>
              <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => {
                if (e.target.files) setFiles(Array.from(e.target.files));
              }} />
            </label>

            {/* List of files with delete button */}
            {files.length > 0 && (
              <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {files.map((file, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#e2e8f0", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", color: theme.textBold, fontWeight: 600 }}>
                    <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                    <button onClick={(e) => { e.preventDefault(); setFiles(files.filter((_, i) => i !== idx)); }} style={{ background: "none", border: "none", color: "#ef4444", fontWeight: 800, padding: 0, cursor: "pointer", display: "flex", fontSize: "12px" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sections Togglers */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: theme.textSoft, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sections</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {(availableSections && availableSections.length > 0 ? ["new-arrivals", "top-selling", ...availableSections] : SECTIONS).map(s => {
                const active = sections.includes(s);
                return (
                  <button 
                    key={s} 
                    type="button"
                    onClick={() => toggleSection(s)} 
                    style={{
                      padding: "8px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 700,
                      background: active ? theme.primary : theme.surface,
                      color: active ? "#ffffff" : theme.textSoft,
                      border: active ? `1px solid ${theme.primary}` : `1px solid ${theme.border}`, 
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Toggle Switched In Stock */}
          <div style={{ paddingTop: "4px" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={(e) => { e.preventDefault(); setInStock(!inStock); }}>
              <div style={{
                width: "42px", height: "22px", borderRadius: "999px",
                background: inStock ? theme.primary : "#94a3b8", position: "relative", transition: "0.2s", flexShrink: 0
              }}>
                <div style={{
                  position: "absolute", top: "2px", left: inStock ? "22px" : "2px",
                  width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "0.2s"
                }} />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: theme.textBold }}>Currently In Stock</span>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${theme.border}`,
          display: "flex", justifyContent: "flex-end", gap: "10px",
          background: "rgba(248, 250, 252, 0.9)", backdropFilter: "blur(10px)",
          borderRadius: "0 0 20px 20px"
        }}>
          <button onClick={onClose} style={{
            padding: "10px 20px", borderRadius: "999px", background: "none",
            border: `1px solid ${theme.border}`, color: theme.textSoft, fontWeight: 700, fontSize: "13px", cursor: "pointer"
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving || !name} style={{
            padding: "10px 20px", borderRadius: "999px", 
            background: theme.primary, color: "#ffffff", 
            border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
            opacity: (!name || isSaving) ? 0.6 : 1
          }}>
            {isSaving ? "Saving..." : "Create Product"}
          </button>
        </div>

      </div>
    </div>
  );
}
