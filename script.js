// ====== BASIC SETTINGS (Solana) ======
const CONTRACT = "FnFcZMAR96k3kZm7Cz7LcvM7pngE8WwEjSAxppFsMqgh"; // Solana mint
const BUY_URL   = "https://raydium.io/swap/?inputMint=sol&outputMint=" + CONTRACT;
const CHART_URL = "https://dexscreener.com/solana/" + CONTRACT;
const TG_URL    = "https://t.me/your_axo_group"; // عدّلها لاحقًا
const X_URL     = "https://x.com/your_axo";      // عدّلها لاحقًا
const DEX_URL   = CHART_URL;

// Fill links & year
document.getElementById("contractText").textContent = CONTRACT;
document.getElementById("buyLink").href  = BUY_URL;
document.getElementById("chartLink").href= CHART_URL;
document.getElementById("howBuy").href   = BUY_URL;
document.getElementById("xLink")?.setAttribute("href", X_URL);
document.getElementById("tgLink")?.setAttribute("href", TG_URL);
document.getElementById("dexLink")?.setAttribute("href", DEX_URL);
document.getElementById("year").textContent = new Date().getFullYear();

// Copy contract to clipboard
function copy(addr){
  navigator.clipboard.writeText(addr).then(()=>{
    const t = document.getElementById("contractText");
    const original = t.textContent;
    t.textContent = "Copied!";
    setTimeout(()=> t.textContent = original, 900);
  });
}
document.getElementById("copyBtn").addEventListener("click", ()=> copy(CONTRACT));
document.getElementById("copyBtn2").addEventListener("click", ()=> copy(CONTRACT));

// Mobile drawer toggle
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
menuBtn?.addEventListener("click", ()=> drawer.classList.toggle("open"));
