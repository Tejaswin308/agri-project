from pathlib import Path

path = Path(r"c:\Users\vahid\OneDrive\Desktop\agri-project\script.js")
text = path.read_text(encoding="utf-8")
start = text.find("// --- PDF Report Generation ---")
if start == -1:
    raise SystemExit("marker not found")

new_block = '''// --- PDF Report Generation ---
// Root cause: the previous export flow used a temporary DOM snapshot that was not
// reliably visible or ready when html2pdf captured it. That could produce a blank
// canvas and therefore a blank PDF. The updated flow builds a visible report
// container, waits for the uploaded image to be ready, and exports that content.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getLocalizedText(value, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") return value[currentLanguage] || value.en || fallback;
  return fallback;
}

function getSeverityLabel(severity) {
  const labels = {
    low: { en: "Low", te: "తక్కువ", hi: "कम", ta: "குறைவு", ml: "കുറവ്", kn: "ಕಡಿಮೆ" },
    medium: { en: "Medium", te: "మధ్యస్థం", hi: "मध्यम", ta: "நடுத்தரம்", ml: "మധ్యస్థం", kn: "ಮಧ್ಯಮ" },
    high: { en: "High", te: "అధికం", hi: "उच्च", ta: "அதிகம்", ml: "ഉயർന്നത്", kn: "అధిక" }
  };
  return (labels[severity] || labels.low)[currentLanguage] || (labels[severity] || labels.low).en;
}

function getDisclaimerText() {
  const texts = {
    en: "AI provides an estimate based on the uploaded image. If the infection is severe or the confidence is low, consult a local agricultural expert before taking action.",
    te: "AI అప్‌లోడ్ చేసిన చిత్రంపై ఆధారపడిన అంచనా మాత్రమే ఇస్తుంది. ఇన్ఫెక్షన్ తీవ్రంగా ఉంటే లేదా ఖచ్చితత్వం తక్కువగా ఉంటే, చర్య తీసుకునే ముందు స్థానిక వ్యవసాయ నిపుణులను సంప్రదించండి.",
    hi: "AI अपलोड की गई तस्वीर के आधार पर अनुमान देता है। यदि संक्रमण गंभीर है या सटीकता कम है, तो कार्रवाई करने से पहले स्थानीय कृषि विशेषज्ञ से सलाह लें।",
    ta: "AI பதிவேற்றிய படத்தின் அடிப்படையில் மதிப்பீட்டை வழங்குகிறது. நோய் தீவிரமாக இருந்தால் அல்லது நம்பகத்தன்மை குறைவாக இருந்தால், நடவடிக்கை எடுப்பதற்கு முன் உள்ளூர் வேளாண்மை நிபுணரை அணுகவும்.",
    ml: "AI അപ്ലോഡ് ചെയ്ത ഇമേജിന്റെ അടിസ്ഥാനത്തിൽ ഒരു കൃത്യമായ തന്നെ അంచനം നൽകുന്നു. രോഗം ഗുരുതരമായിരുന്നാൽ അല്ലെങ്കിൽ കൃത്യത കുറവായാൽ, कार्रवाई తీసుకునുന്നതിന് മുമ്പ് പ്രാദേശിക കൃഷിഅനുഭവക്കാരനുമായി సంపർക്കുക.",
    kn: "AI ಅಪ್ಲോഡ് ಮಾಡಿದ ಚಿತ್ರದ ಆಧಾರದ ಮೇಲೆ ಅಂದಾಜು ನೀಡುತ್ತದೆ. ಸೋಂಕು ತೀವ್ರವಾದರೆ ಅಥವಾ ನಿಖರತೆ ಕಡಿಮೆ ಇದ್ದರೆ, ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳುವ ಮೊದಲು ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ."
  };
  return texts[currentLanguage] || texts.en;
}

function formatReportDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function getPreviewImageDataUrl() {
  const preview = document.getElementById("image-preview");
  if (!preview || !preview.src || preview.src === window.location.href || preview.src === "#") {
    return null;
  }

  if (preview.src.startsWith("data:")) {
    return preview.src;
  }

  if (preview.complete && preview.naturalWidth > 0) {
    const canvas = document.createElement("canvas");
    canvas.width = preview.naturalWidth;
    canvas.height = preview.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(preview, 0, 0);
    return canvas.toDataURL("image/png");
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = preview.src;
  });
}

async function generatePDFReport() {
  const diseaseKey = window.lastDetectedDisease || "healthy";
  const data = diseaseDatabase[diseaseKey];
  if (!data) return;

  const t = translations[currentLanguage] || translations["en"];
  const g = function(k, fb) { return t[k] || fb; };

  const pdfTitle = g("pdf-title", "RythuMitra - Smart Farming Assistant");
  const pdfRepTitle = g("pdf-report-title", "Crop Health & Disease Analysis Report");
  const pdfDateLbl = g("pdf-date", "Date and Time of Analysis");
  const pdfDisLbl = g("pdf-disease-name", "Detected Disease Name");
  const pdfHpLbl = g("pdf-health-percent", "Plant Health Percentage");
  const pdfConfLbl = g("pdf-confidence", "Confidence Score");
  const pdfSevLbl = g("pdf-severity", "Severity Level");
  const pdfSymLbl = g("pdf-symptoms", "Symptoms");
  const pdfOrgLbl = g("pdf-organic-treat", "Organic Treatment Recommendations");
  const pdfChemLbl = g("pdf-chemical-treat", "Chemical Treatment Recommendations");
  const pdfChnLbl = g("pdf-chemical-name", "Recommended Chemical Name");
  const pdfDosLbl = g("pdf-dosage", "Recommended Dosage");
  const pdfSprLbl = g("pdf-sprays-interval", "Number of Sprays & Interval");
  const pdfCostLbl = g("pdf-est-cost", "Estimated Treatment Cost (INR)");
  const pdfPrevLbl = g("pdf-prevention", "Prevention Recommendations");
  const pdfDislTitle = g("pdf-disclaimer-title", "Disclaimer");
  const pdfNotAvail = g("pdf-not-available", "Not available");

  const diseaseName = getLocalizedText(data.diseaseName, pdfNotAvail);
  const healthPct = Math.max(0, Math.min(100, 100 - (data.severityVal || 0)));
  const severity = data.severity || "low";
  const severityLabel = getSeverityLabel(severity);
  const sevColor = severity === "high" ? "#d32f2f" : severity === "medium" ? "#f57c00" : "#388e3c";
  const hpColor = healthPct < 40 ? "#d32f2f" : healthPct < 80 ? "#f57c00" : "#388e3c";

  const sympText = getLocalizedText(data.symptoms, pdfNotAvail);
  const orgText = getLocalizedText(data.organic, pdfNotAvail);
  const chemText = getLocalizedText(data.chemical, pdfNotAvail);
  const prevText = getLocalizedText(data.prevention, pdfNotAvail);
  const chemName = getLocalizedText(data.chemicalName, pdfNotAvail);
  const dosage = getLocalizedText(data.dosage, pdfNotAvail);
  const sprays = getLocalizedText(data.spraysInterval, pdfNotAvail);
  const cost = getLocalizedText(data.estCost, pdfNotAvail);

  const now = new Date();
  const fmtDate = formatReportDate(now);
  const fmtFile = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;

  const imageDataUrl = await getPreviewImageDataUrl();
  const imageMarkup = imageDataUrl
    ? `<div style="width:180px; margin-right:16px;"><div style="border:1px solid #d9e9d8;border-radius:8px;padding:8px;background:#fafcf9;"><img src="${imageDataUrl}" style="max-width:100%;max-height:150px;display:block;margin:0 auto;border-radius:6px;" alt="Plant"></div></div>`
    : "";

  const reportMarkup = `
    <div style="width:794px;max-width:794px;padding:30px 32px;background:#ffffff;font-family:'Noto Sans Devanagari','Noto Sans Telugu','Noto Sans Tamil','Noto Sans Kannada','Noto Sans Malayalam','Segoe UI',Arial,sans-serif;color:#333;box-sizing:border-box;line-height:1.55;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #2e7d32;margin-bottom:20px;">
        <div>
          <h1 style="margin:0;font-size:20px;color:#2e7d32;font-weight:700;">${escapeHtml(pdfTitle)}</h1>
          <h2 style="margin:6px 0 0;font-size:13px;color:#555;font-weight:600;">${escapeHtml(pdfRepTitle)}</h2>
        </div>
        <div style="font-size:11px;color:#666;text-align:right;line-height:1.5;white-space:nowrap;">
          <strong>${escapeHtml(pdfDateLbl)}:</strong><br>${escapeHtml(fmtDate)}
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:18px;">
        ${imageMarkup}
        <div style="flex:1;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr style="background:#f5f5f5;"><td style="padding:9px 10px;font-weight:700;color:#555;width:42%;">${escapeHtml(pdfDisLbl)}</td><td style="padding:9px 10px;font-weight:700;color:#2e7d32;">${escapeHtml(diseaseName)}</td></tr>
            <tr><td style="padding:9px 10px;font-weight:700;color:#555;">${escapeHtml(pdfHpLbl)}</td><td style="padding:9px 10px;font-weight:700;color:${hpColor};">${healthPct}%</td></tr>
            <tr style="background:#f5f5f5;"><td style="padding:9px 10px;font-weight:700;color:#555;">${escapeHtml(pdfConfLbl)}</td><td style="padding:9px 10px;font-weight:700;">${escapeHtml(data.confidence || pdfNotAvail)}</td></tr>
            <tr><td style="padding:9px 10px;font-weight:700;color:#555;">${escapeHtml(pdfSevLbl)}</td><td style="padding:9px 10px;font-weight:700;color:${sevColor};">${escapeHtml(severityLabel)}</td></tr>
          </table>
        </div>
      </div>
      <h3 style="margin:0 0 8px;padding-bottom:5px;border-bottom:2px solid #c8e6c9;color:#2e7d32;font-size:14px;">${escapeHtml(pdfSymLbl)}</h3>
      <p style="margin:0 0 14px;font-size:13px;color:#444;text-align:justify;">${escapeHtml(sympText)}</p>
      <h3 style="margin:0 0 8px;padding-bottom:5px;border-bottom:2px solid #c8e6c9;color:#2e7d32;font-size:14px;">${escapeHtml(pdfPrevLbl)}</h3>
      <p style="margin:0 0 14px;font-size:13px;color:#444;text-align:justify;">${escapeHtml(prevText)}</p>
      <h3 style="margin:0 0 8px;padding-bottom:5px;border-bottom:2px solid #c8e6c9;color:#2e7d32;font-size:14px;">${escapeHtml(pdfOrgLbl)}</h3>
      <p style="margin:0 0 14px;font-size:13px;color:#444;text-align:justify;">${escapeHtml(orgText)}</p>
      <h3 style="margin:0 0 8px;padding-bottom:5px;border-bottom:2px solid #c8e6c9;color:#2e7d32;font-size:14px;">${escapeHtml(pdfChemLbl)}</h3>
      <p style="margin:0 0 12px;font-size:13px;color:#444;text-align:justify;">${escapeHtml(chemText)}</p>
      <div style="background:#f1f8e9;border:1px solid #c8e6c9;border-radius:6px;padding:12px 13px;margin-bottom:16px;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tr><td style="padding:6px 0;font-weight:700;color:#555;width:40%;">${escapeHtml(pdfChnLbl)}:</td><td style="padding:6px 0;font-weight:700;color:#1b5e20;">${escapeHtml(chemName)}</td></tr>
          <tr style="border-top:1px solid #dcedc8;"><td style="padding:6px 0;font-weight:700;color:#555;">${escapeHtml(pdfDosLbl)}:</td><td style="padding:6px 0;color:#444;">${escapeHtml(dosage)}</td></tr>
          <tr style="border-top:1px solid #dcedc8;"><td style="padding:6px 0;font-weight:700;color:#555;">${escapeHtml(pdfSprLbl)}:</td><td style="padding:6px 0;color:#444;">${escapeHtml(sprays)}</td></tr>
          <tr style="border-top:1px solid #dcedc8;"><td style="padding:6px 0;font-weight:700;color:#555;">${escapeHtml(pdfCostLbl)}:</td><td style="padding:6px 0;font-weight:700;color:#b71c1c;">${escapeHtml(cost)}</td></tr>
        </table>
      </div>
      <div style="background:#fffde7;border-left:4px solid #f9a825;padding:11px 14px;border-radius:4px;">
        <h4 style="margin:0 0 4px;font-size:12px;color:#e65100;font-weight:700;">${escapeHtml(pdfDislTitle)}</h4>
        <p style="margin:0;font-size:11px;color:#555;line-height:1.55;">${escapeHtml(getDisclaimerText())}</p>
      </div>
    </div>
  `;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.12);z-index:2147483647;display:flex;justify-content:center;align-items:flex-start;padding:20px;overflow:auto;";
  wrapper.innerHTML = reportMarkup;
  document.body.appendChild(wrapper);

  await document.fonts.ready;
  await new Promise((resolve) => setTimeout(resolve, 400));

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `Disease_Report_${fmtFile}.pdf`,
    image: { type: "jpeg", quality: 0.97 },
    html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  try {
    await html2pdf().set(opt).from(wrapper).save();
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  }
}

async function generatePdfSmokeTest() {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "width:794px;padding:32px;background:#fff;font-family:'Noto Sans Devanagari','Noto Sans Telugu','Noto Sans Tamil','Noto Sans Kannada','Noto Sans Malayalam','Segoe UI',Arial,sans-serif;color:#222;";
  wrapper.innerHTML = `
    <h1 style="margin:0 0 10px;font-size:24px;color:#2e7d32;">Disease Report Test</h1>
    <p style="margin:0 0 8px;font-size:14px;">${escapeHtml(formatReportDate(new Date()))}</p>
    <p style="margin:0;font-size:16px;">PDF generation is working</p>
  `;
  document.body.appendChild(wrapper);
  await document.fonts.ready;
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    await html2pdf().set({
      margin: [10, 10, 10, 10],
      filename: "Pdf_Smoke_Test.pdf",
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(wrapper).save();
  } finally {
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  }
}

window.generatePdfSmokeTest = generatePdfSmokeTest;

function initDownloadReport() {
  const btn = document.getElementById("btn-download-report");
  if (!btn) return;
  btn.addEventListener("click", function() {
    if (!window.lastDetectedDisease) {
      alert("Please scan a leaf image first before downloading the report.");
      return;
    }
    generatePDFReport();
  });
}
'''

path.write_text(text[:start] + new_block, encoding="utf-8")
print("updated")
