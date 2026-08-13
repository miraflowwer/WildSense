# Scientific Methodology & Empirical Research Foundation

> **Product Version:** WildSense v1.5.0  
> **Target Geographic Landscape:** Bandipur–Nagarhole–Mudumalai Corridor (Western Ghats / Nilgiri Biosphere Reserve, India)  
> **Statutory Alignment:** Wildlife (Protection) Act, 1972 (§9) & Digital Personal Data Protection (DPDP) Act, 2023 (§6)  
> **SDG Alignment:** UN SDG 15 (Life on Land)  

This document details the scientific rationale, mathematical formulation, ingested spatial data layers, empirical field surveys, and peer-reviewed literature underpinning **WildSense (by GAHM)**.

---

## 1. Problem Landscape & Empirical Field Data (India)

India is home to approximately **60% of the world's wild Asian elephants** (*Elephas maximus*), with over 27,000 individuals navigating increasingly fragmented landscapes.

### Parliamentary Incident Data (2019–2024)
According to official reports tabled in the Parliament of India by the Ministry of Environment, Forest and Climate Change (MoEFCC):
- **2,829 human casualties** were recorded between 2019–20 and 2023–24 (~565 deaths per year).
- **528 elephant mortalities** occurred over the same five-year period, with 392 attributable to retaliatory agricultural fence electrocution, train collisions, and poaching.
- More than **500,000 marginal farming households** suffer recurring seasonal crop damage along forest boundary perimeters ([Elephant Task Force of India, 2010](https://digitalrepository.wii.gov.in/handle/123456789/1120)).

### Empirical Survey: Bandipur Corridor Buffer Zone (2025)
A primary field investigation across farming communities in the Bandipur–Mudumalai fringe (Karnataka/Tamil Nadu border) revealed:
1. **70.8%** of surveyed households reported worsening human-wildlife encounters.
2. **56.6%** experienced severe crop losses exceeding 50% of annual harvest value.
3. **60.0%+** maintained positive attitudes toward elephant conservation **provided they received reliable, native-language early warnings** to protect crops non-lethally.

*(Figure 1 embedded in app: `bandipur_survey.png` — Mongabay India Special Field Investigation, 2025)*.

---

## 2. The Frontline Staffing Deficit

Frontline forest rangers in South Asian protected areas face extreme land-to-staff ratios:
- **Current South Asian Staff Density:** **~1 ranger per 72 km²** ([Nature Sustainability, 2022](https://www.nature.com/articles/s41893-022-00970-0)).
- **Kunming-Montreal 30-by-30 Target Benchmark:** **1 ranger per 26 km²** (IUCN World Commission on Protected Areas).
- **Workforce Deficit:** Protected areas operate at nearly **5× below** required monitoring capacity.

*(Figure 2 embedded in app: `frontline_staffing.png` — Nature Sustainability & IUCN WCPA, 2022)*.

---

## 3. Ingested Scientific & Spatial Data Layers

WildSense ingests four authoritative spatial, environmental, and meteorological datasets:

| Layer # | Data Source | Ingested Parameters | Engine Role |
| :--- | :--- | :--- | :--- |
| **01** | **WII & MoEFCC Elephant Corridors Atlas (2023)** | Digitized corridor polygons, bottleneck geometries, reserve boundaries | Spatial baseline & hotspot weighting (**Signal 4: +15%**) |
| **02** | **Copernicus Sentinel-2 (ESA)** | 10m multispectral NDVI & NDRE canopy moisture indices | Crop ripeness & vegetation density attractants (**Signal 1 & 7**) |
| **03** | **IMD & NASA FIRMS Telemetry** | Precipitation, monsoon onset dates, dry-season drought indicators | Micro-climate seasonal risk multiplier (**Signal 7: +5%**) |
| **04** | **OpenStreetMap & Survey of India** | Village geometries, crop parcels, road/rail intersections | Proximity decay calculation (**Signal 1: +25%**) |

---

## 4. The 7-Signal Mathematical Weight Formulation

WildSense computes an explainable 0–100 risk score using an additive multi-factor model:

$$\text{Risk}(e) = \min\left(100, \, \max\left(0, \, \sum_{i=1}^{7} \left(W_i \cdot S_i(e)\right) - \Delta_{\text{uncertainty}}(e)\right)\right)$$

Where $W_i \in \{25, 20, 15, 15, 10, 10, 5\}$ and $\sum_{i=1}^{7} W_i = 100$.

### Signal Sub-Formulations
1. **Farmland & Settlement Proximity ($W_1 = 25\%$):**
   $$S_{\text{prox}}(e) = \max\left(0, \, 1 - \frac{d(e, \mathcal{B})}{d_{\max}}\right) \quad (d_{\max} = 12\text{ km})$$
2. **Directional Movement Vector ($W_2 = 20\%$):**
   $$S_{\text{move}}(e) = \begin{cases} 1.0 & \text{if } \vec{v} \cdot \vec{n}_{\mathcal{B}} > 0 \text{ (approaching boundary)} \\ 0.5 & \text{if } \vec{v} \cdot \vec{n}_{\mathcal{B}} = 0 \text{ (parallel trajectory)} \\ 0.0 & \text{if } \vec{v} \cdot \vec{n}_{\mathcal{B}} < 0 \text{ (moving into core)} \end{cases}$$
3. **Species Threat Classification ($W_3 = 15\%$):**
   $$S_{\text{species}}(e) = \frac{\text{StatutoryWeight}(sp)}{15} \quad (\text{Elephant } 15/15, \text{Tiger } 14/15, \text{Leopard } 13/15)$$
4. **Historical Conflict Hotspot ($W_4 = 15\%$):**
   $$S_{\text{hotspot}}(e) = \exp\left(-\frac{d(e, \mathcal{H})^2}{2\sigma^2}\right)$$
5. **Diurnal Vulnerability Window ($W_5 = 10\%$):**
   $$S_{\text{time}}(e) = \text{DiurnalMultiplier}(t) \quad (\text{Dusk } 1.0, \text{Night } 0.8, \text{Dawn } 0.7, \text{Day } 0.4)$$
6. **Herd / Group Size Dynamic ($W_6 = 10\%$):**
   $$S_{\text{group}}(e) = \min\left(1.0, \, \frac{N_{\text{individuals}}}{10}\right)$$
7. **Micro-Climate & Monsoon Season Multiplier ($W_7 = 5\%$):**
   $$S_{\text{weather}}(e) = f(\text{NDVI}, \, \text{Precipitation}, \, \text{DroughtIndex})$$

### Uncertainty Regularization Penalty
$$\Delta_{\text{uncertainty}}(e) = \sum_{k \in \mathcal{K}} \delta_k \cdot (1 - c_k(e))$$

- **Missing Movement Vector:** $\delta_{\text{vector}} = -8\text{ pts}$
- **Low Sensor Confidence ($c_k < 0.65$):** $\delta_{\text{confidence}} = -5\text{ pts}$

---

## 5. Indian Statutory & Ethical Frameworks

- **Wildlife (Protection) Act, 1972 (§9 & §38-V):** Schedule I protection mandate. High-precision GPS coordinates are quarantined to verified ranger dashboards and never leaked over public SMS broadcasts to prevent organized poaching syndicates and retaliatory mobs.
- **Digital Personal Data Protection (DPDP) Act, 2023 (§6):** Villager registration requires explicit informed consent strictly for emergency warnings. No biometrics or surveillance. Immediate unsubscription via **STOP**.

---

## 6. Peer-Reviewed Academic & Government Bibliography

1. **Appleton, M. R., Courtiol, A., et al. (2022).** *Protected area staff density in South Asia & global 30-by-30 targets.* Nature Sustainability, 5(11), 953–962. [DOI: 10.1038/s41893-022-00970-0](https://www.nature.com/articles/s41893-022-00970-0).
2. **Mongabay India (2025).** *Expanding elephant range fuels human-wildlife conflict in southern India.* Mongabay Environmental News. [mongabay.com](https://india.mongabay.com/2025/09/expanding-elephant-range-fuels-human-wildlife-conflict/).
3. **Ministry of Environment, Forest and Climate Change (MoEFCC) (2024).** *Human casualties and elephant mortality Parliamentary Data (2019–2024).* Government of India Lok Sabha & Rajya Sabha Records. [sansad.in](https://sansad.in/).
4. **Rangarajan, M., Desai, A., Sukumar, R., et al. (2010).** *Gajah: Securing the Future for Elephants in India.* Report of the Elephant Task Force, MoEFCC, Government of India. [WII Digital Repository](https://digitalrepository.wii.gov.in/handle/123456789/1120).
5. **Menon, V., Tiwari, S. K., et al. (WII & Project Elephant) (2023).** *Right of Passage: Elephant Corridors of India (Second Edition).* Wildlife Trust of India & Wildlife Institute of India. [wii.gov.in](https://wii.gov.in/).
6. **Bhattacharya, R., Roy, M., et al. (2023).** *Spatial determinants of human-elephant conflict and retaliatory electrocution in agricultural matrices.* Ecological Indicators / Research Square. [DOI: 10.21203/rs.3.rs-2304878/v1](https://www.researchsquare.com/article/rs-2304878/v1).
7. **Ministry of Law and Justice (2023).** *The Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023).* The Gazette of India / MeitY. [meity.gov.in](https://www.meity.gov.in/content/digital-personal-data-protection-act-2023).
8. **Parliament of India (1972).** *The Wildlife (Protection) Act, 1972 (As Amended 2022).* Ministry of Law and Justice (IndiaCode Portal). [indiacode.nic.in](https://www.indiacode.nic.in/handle/123456789/1726).
