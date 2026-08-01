window.PORTFOLIO_STANDARD = Object.freeze({
  statuses: ["complete", "basic", "pending"],
  sectionChecklist: ["角色/时间", "方法", "产出", "反思", "可访问性"],
  requiredMetaFields: ["category", "contentStatus", "requiredSections", "tags"]
});

window.PORTFOLIO_PROJECTS = Object.freeze({
  forma: {
    href: "./forma.html",
    title: "Forma",
    shortTitle: "Forma",
    imageBase: "./assets/forma-cover-website",
    imageWidth: 2400,
    imageHeight: 1600,
    alt: "Forma furniture brand identity and digital experience",
    category: "works",
    contentStatus: "complete",
    requiredSections: ["角色", "方法", "产出", "反思", "结果"],
    tags: ["Brand", "UI/UX", "Packaging", "Homepage"],
    homeMeta: "Brand Identity<br>Website &amp; Packaging",
    listingMeta: "Brand Identity • Website • Packaging System",
    moreMeta: "Brand Identity • Website",
    related: ["nowAssist", "aiControlTower", "sheepguard"]
  },
  nowAssist: {
    href: "./now-assist-redesign.html",
    title: "Now Assist Redesign",
    shortTitle: "Now Assist",
    imageBase: "./assets/now-assist-cover-from-repdf",
    imageWidth: 2400,
    imageHeight: 1350,
    alt: "ServiceNow Now Assist redesign",
    imageClass: "project-image--nowassist-cover",
    category: "product-design",
    contentStatus: "complete",
    requiredSections: ["角色", "方法", "产出", "反思", "结果"],
    tags: ["AI Product Design", "ServiceNow", "Workflow", "Research"],
    homeMeta: "ServiceNow Internship<br>AI Product Design",
    listingMeta: "ServiceNow Internship • AI Product Design",
    moreMeta: "AI Research • Interaction Design",
    related: ["columnPinning", "aiControlTower", "sheepguard"]
  },
  aiControlTower: {
    href: "./ai-control-tower.html",
    title: "AI Pattern and Visual Language Unification",
    imageBase: "./assets/ai-pattern-cover-from-1pdf",
    imageWidth: 2400,
    imageHeight: 1350,
    alt: "ServiceNow AI Pattern and Visual Language Unification",
    imageClass: "project-image--aict-cover",
    category: "product-design",
    contentStatus: "complete",
    requiredSections: ["角色", "方法", "产出", "反思", "结果"],
    tags: ["Enterprise AI", "Product Language", "ServiceNow", "Interaction"],
    homeMeta: "ServiceNow Internship<br>Enterprise AI",
    listingMeta: "ServiceNow Internship • Enterprise AI",
    moreMeta: "Product Design • Enterprise AI",
    related: ["dwHeader", "nowAssist", "sheepguard"]
  },
  dwHeader: {
    href: "./dw-simplified-header.html",
    title: "DW Simplified Header",
    imageBase: "./assets/dw-cover-from-2pdf",
    imageWidth: 2400,
    imageHeight: 1350,
    alt: "ServiceNow Dynamic Window simplified header",
    imageClass: "project-image--wide project-image--dw-cover",
    figureClass: "project-detail-more-card-image--dw-cover",
    category: "product-design",
    contentStatus: "basic",
    requiredSections: ["角色", "方法", "产出", "反思", "结果"],
    tags: ["ServiceNow", "Workflow UX", "Enterprise"],
    homeMeta: "ServiceNow Internship<br>Workflow UX",
    listingMeta: "ServiceNow Internship • Workflow UX",
    moreMeta: "ServiceNow • Enterprise UX",
    related: ["aiControlTower", "nowAssist", "columnPinning"]
  },
  columnPinning: {
    href: "./column-pinning-exploration.html",
    title: "Column Pinning Exploration",
    shortTitle: "Column Pinning",
    imageBase: "./assets/column-pinning-cover-from-ds-pdf",
    imageWidth: 2400,
    imageHeight: 1350,
    alt: "ServiceNow column pinning exploration",
    imageClass: "project-image--wide project-image--column-cover",
    category: "product-design",
    contentStatus: "basic",
    requiredSections: ["角色", "方法", "产出", "反思", "结果"],
    tags: ["ServiceNow", "Enterprise UX", "Interaction"],
    homeMeta: "ServiceNow Internship<br>Enterprise UX",
    listingMeta: "ServiceNow Internship • Enterprise UX",
    moreMeta: "ServiceNow • Enterprise UX",
    related: ["nowAssist", "aiControlTower", "sheepguard"]
  },
  sheepguard: {
    href: "./sheepguard.html",
    title: "SheepGuard",
    imageBase: "./assets/sheepguard/sheepguard-cover-45",
    imageWidth: 2400,
    imageHeight: 1350,
    alt: "SheepGuard scam detection app cover",
    category: "product-design",
    contentStatus: "basic",
    requiredSections: ["角色", "方法", "产出", "反思", "结果"],
    tags: ["UX", "Mobile", "Safety", "Detection"],
    homeMeta: "UI / UX Design<br>Scam Detection App",
    listingMeta: "UI / UX Design • Scam Detection App",
    moreMeta: "UI / UX Design • Scam Detection",
    related: ["forma", "nowAssist", "aiControlTower"]
  },
  allerpal: {
    href: "./allerpal.html",
    title: "AllerPal",
    imageBase: "./assets/allerpal/app-showcase",
    imageWidth: 2400,
    imageHeight: 1307,
    alt: "AllerPal accessibility and food allergy communication concept",
    category: "product-design",
    contentStatus: "complete",
    requiredSections: ["角色", "方法", "产出", "反思", "结果"],
    tags: ["UI / UX Design", "Accessibility", "Product Strategy", "Children"],
    homeMeta: "UI / UX Design<br>Accessibility &amp; Product Strategy",
    listingMeta: "UI / UX Design • Accessibility &amp; Product Strategy",
    moreMeta: "UI / UX Design • Accessibility",
    related: ["nowAssist", "aiControlTower"]
  },
  museumOfTechnology: {
    href: "./museum-of-technology.html",
    title: "Museum of Technology",
    shortTitle: "Museum of Technology",
    imageBase: "./assets/images/museum-of-technology/museum-25-cover",
    imageWidth: 2400,
    imageHeight: 1350,
    alt: "Museum of Technology brand and wayfinding project cover",
    category: "works",
    contentStatus: "basic",
    requiredSections: ["角色", "方法", "产出", "反思", "结果"],
    tags: ["Brand", "Environmental Design", "Wayfinding"],
    homeMeta: "Brand Identity<br>Environmental Design",
    listingMeta: "Brand Identity • Environmental Design",
    moreMeta: "Brand Identity • Environmental Design",
    related: ["forma", "nowAssist", "aiControlTower"]
  }
});

window.PORTFOLIO_COLLECTIONS = Object.freeze({
  homeFeatured: [
    { id: "forma", feature: true },
    { id: "dwHeader", feature: true },
    ["nowAssist", "aiControlTower"],
    { id: "columnPinning", feature: true },
    { id: "sheepguard", feature: true },
    { id: "allerpal", feature: true }
  ],
  works: ["forma", "museumOfTechnology"],
  productDesigns: ["nowAssist", "aiControlTower", "dwHeader", "columnPinning", "sheepguard", "allerpal"]
});

window.PORTFOLIO_CATEGORY_RULES = Object.freeze({
  home: "homeFeatured",
  works: "works",
  productDesigns: "productDesigns",
  contentPriority: {
    complete: "已完成",
    basic: "基础",
    pending: "待补"
  },
  categoryLabel: {
    works: "作品总览（Works）",
    "product-design": "产品设计（Product Designs）"
  }
});
