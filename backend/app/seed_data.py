import os
import datetime
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
from app.models import User, RecyclingGuide, RecyclingFacility, UserChallenge, RecyclingActivity, WasteScan
from app.auth import get_password_hash

GUIDES_DATA = [
    {
        "category_key": "plastic",
        "title": "Plastic Recycling",
        "short_description": "Rigid bottles, jugs, tubs, and packaging polymers (Resin codes #1 through #7).",
        "common_examples": ["Water & soda bottles (PET #1)", "Milk jugs & detergent bottles (HDPE #2)", "Yogurt tubs & bottle caps (PP #5)", "Takeaway containers"],
        "disposal_method": "Place clean, empty rigid plastics into curbside recycling bins. Avoid bag containers in plastic grocery bags.",
        "preparation_steps": ["Empty all liquid contents completely", "Rinse with cold water to remove food residues", "Keep caps screwed on to prevent loose plastic litter in sorting facilities", "Do not crush HDPE jugs if your locality uses optical air-jet sorters"],
        "reuse_ideas": ["Upcycle large jugs as self-watering planters or garden scoops", "Use plastic tubs for workshop screws, nuts, and bolts organization", "Refill detergent bottles at bulk zero-waste refill stores"],
        "common_mistakes": ["Placing plastic grocery bags or cling wrap in curbside bins (they tangle recycling machinery)", "Leaving food residue that contaminates entire bales", "Assuming every numbered triangle is accepted locally"],
        "safety_precautions": ["Never burn plastics at home (releases toxic dioxins and hydrogen cyanide)", "Avoid microwaving plastics not certified as microwave-safe"],
        "local_acceptance_notes": "PET #1 and HDPE #2 are accepted in 99% of municipal programs. PP #5 acceptance is expanding rapidly. PVC #3 and PS #6 (styrofoam) are rarely accepted curbside.",
        "environmental_impact": "Recycling one ton of plastic saves 5,774 kWh of electricity, 16.3 barrels of oil, and 30 cubic yards of landfill airspace.",
        "icon_name": "bot"
    },
    {
        "category_key": "paper",
        "title": "Paper Recycling",
        "short_description": "Clean, dry cellulose fibre materials including office sheets, newspapers, journals, and envelopes.",
        "common_examples": ["Office printing paper", "Newspapers & circulars", "Magazines & softcover books", "Mail & window envelopes", "Paper gift bags"],
        "disposal_method": "Keep dry and deposit in the paper recycling bin. Keep separated from food waste and liquid containers.",
        "preparation_steps": ["Ensure paper is dry and grease-free", "Remove heavy plastic sleeves, spiral bindings, and foil embossing", "Keep window envelopes intact (windows are filtered out during pulping)", "Do not shred unless containing private data"],
        "reuse_ideas": ["Use single-sided printed paper as drafting or scratch paper", "Use old newspapers as biodegradable weed barriers or for streak-free window cleaning", "Shred unprinted paper for compost carbon balancing"],
        "common_mistakes": ["Recycling greasy food wrappers, napkins, or paper towels", "Recycling thermal store receipts containing endocrine-disrupting BPA", "Recycling coffee cups with polyethylene plastic inner liners"],
        "safety_precautions": ["Avoid breathing fine dust from large paper shredding operations", "Keep stored paper away from electrical panels and heat sources"],
        "local_acceptance_notes": "Widely accepted universally. Check if your municipality prefers loose paper or bundled tied stacks.",
        "environmental_impact": "Recycling 1 ton of paper preserves 17 mature trees, 7,000 gallons of water, and 4,100 kWh of electricity.",
        "icon_name": "file-text"
    },
    {
        "category_key": "cardboard",
        "title": "Cardboard & Paperboard",
        "short_description": "Corrugated shipping cartons, cardboard cartons, shoe boxes, and dry cereal packaging.",
        "common_examples": ["Corrugated shipping boxes", "Cereal & pasta boxes", "Shoe & appliance boxes", "Paper egg cartons", "Toilet paper rolls"],
        "disposal_method": "Flatten completely and place in curbside recycling or deliver to a cardboard recycling drop-off bin.",
        "preparation_steps": ["Break down and flatten every box to conserve truck space", "Remove all styrofoam blocks, bubble wrap, and plastic pouches", "Ensure cardboard has not absorbed motor oil or cooking grease", "Keep boxes dry"],
        "reuse_ideas": ["Use flattened boxes for sheet mulching under mulch in gardens", "Repurpose sturdy boxes for home moves, parcel postage, or cat scratchers", "Use for children craft projects"],
        "common_mistakes": ["Leaving grease-stained pizza box bottoms in the cardboard recycling stream", "Leaving plastic inflatable packing pillows inside boxes", "Throwing unflattened boxes into bins, causing premature bin overflowing"],
        "safety_precautions": ["Use a safety utility knife with a retractable blade when breaking down heavy double-walled boxes", "Wear gloves to prevent cardboard paper cuts"],
        "local_acceptance_notes": "Accepted in nearly all curbside programs. Wax-coated produce boxes require commercial composting.",
        "environmental_impact": "Recycled cardboard requires 75% less energy to manufacture than virgin cardboard from timber pulp.",
        "icon_name": "box"
    },
    {
        "category_key": "glass",
        "title": "Glass Containers",
        "short_description": "Inert soda-lime silica containers including beverage bottles, sauce bottles, and food jars.",
        "common_examples": ["Wine, beer & soda bottles", "Pasta sauce jars", "Jam and condiment jars", "Olive oil bottles", "Pickle jars"],
        "disposal_method": "Rinse clean and place in the glass recycling stream or dedicated bottle drop-off depot.",
        "preparation_steps": ["Empty all liquid and scrape food remnants", "Give a quick water rinse (labels can stay on)", "Remove metal or plastic lids and recycle separately", "Never mix with window glass, Pyrex, or porcelain"],
        "reuse_ideas": ["Repurpose mason jars for bulk pantry storage (beans, grains, pasta)", "Use glass jars for homemade jams, pickles, or candle making", "Turn wine bottles into self-watering capillary planters"],
        "common_mistakes": ["Throwing heat-resistant Pyrex cookware, light bulbs, or drinking glasses into glass bins (they ruin glass recycling furnaces)", "Placing broken ceramics or mirrors in glass bins"],
        "safety_precautions": ["Never leave jagged broken glass loose in recycling bins", "Wrap broken glass securely in several layers of newspaper and label clearly"],
        "local_acceptance_notes": "Glass is 100% recyclable infinitely with zero loss in quality. Some municipalities collect glass separately to prevent glass shard contamination in paper bales.",
        "environmental_impact": "Every metric ton of recycled glass saves 1.2 tons of virgin raw materials (sand, soda ash, limestone) and cuts CO2 emissions by 60%.",
        "icon_name": "glass-water"
    },
    {
        "category_key": "metal",
        "title": "Metal & Aluminium Cans",
        "short_description": "Ferrous steel tin cans, aluminium beverage cans, clean foil containers, and metal lids.",
        "common_examples": ["Aluminium beverage cans", "Tin/steel soup & bean cans", "Clean aluminium baking foil", "Metal bottle crowns & jar lids", "Empty aerosol cans"],
        "disposal_method": "Rinse clean and place in curbside metal recycling. Ferrous cans are magnetically separated at processing plants.",
        "preparation_steps": ["Rinse clean of sauces and grease", "Tuck sharp cut lids inside the can body", "Scrunch clean aluminium foil into a tight ball (size of a tennis ball)", "Ensure aerosol cans are completely discharged"],
        "reuse_ideas": ["Upcycle clean steel cans as stationery pencil holders or utensil caddies", "Use clean tins as seed starter pots with punctured drainage holes", "Save scrap brass, copper, and aluminium for metal scrap dealers"],
        "common_mistakes": ["Throwing full or pressurized aerosol cans into recycling bins (explosion risk)", "Recycling wire coat hangers or propane canisters curbside"],
        "safety_precautions": ["Watch for sharp lid edges on opened tin cans to avoid lacerations", "Never attempt to puncture gas canisters"],
        "local_acceptance_notes": "Aluminium and steel cans enjoy near 100% municipal acceptance due to high commodity value.",
        "environmental_impact": "Recycling aluminium saves 95% of the energy required for primary production from bauxite ore.",
        "icon_name": "shield"
    },
    {
        "category_key": "organic",
        "title": "Organic & Food Waste",
        "short_description": "Biodegradable organic material including kitchen fruit/vegetable scraps, coffee grounds, and yard trimmings.",
        "common_examples": ["Vegetable & fruit peelings", "Coffee grounds & paper coffee filters", "Eggshells", "Yard leaves, grass clippings & twigs", "Tea leaves"],
        "disposal_method": "Place in municipal green organic bin or process via home composting bin, worm farm, or Bokashi fermenter.",
        "preparation_steps": ["Keep organic waste free from plastic stickers, twist ties, and rubber bands", "Drain excess liquid from food scraps to reduce odor", "Layer kitchen greens with dry brown leaves or cardboard in home composters"],
        "reuse_ideas": ["Create nutrient-rich compost humus for garden soil conditioning", "Brew compost tea as an organic natural liquid fertilizer", "Save vegetable trimmings in a freezer bag to boil rich vegetable stock"],
        "common_mistakes": ["Putting plastic stickers from fruit peels into compost", "Adding pet waste or diseased garden plants to food compost", "Sending organic waste to landfills where it decomposes into potent methane gas"],
        "safety_precautions": ["Maintain proper aerated compost moisture and turning to avoid anaerobic pathogen growth", "Keep compost bins rodent-proof"],
        "local_acceptance_notes": "Accepted in municipal green bin programs. Meat, bones, and dairy are accepted in industrial composting but should be avoided in basic backyard bins.",
        "environmental_impact": "Diverting organics from landfills prevents methane emissions (which is 28x more potent than CO2 as a greenhouse gas).",
        "icon_name": "apple"
    },
    {
        "category_key": "electronic",
        "title": "Electronic Waste (E-Waste)",
        "short_description": "Discarded electrical or electronic devices, computer hardware, circuits, mobile phones, and batteries.",
        "common_examples": ["Old smartphones, tablets & chargers", "Laptops, PC towers & power supplies", "Printed circuit boards & cables", "Lithium-ion & alkaline batteries", "Televisions & monitors"],
        "disposal_method": "Take to verified e-waste collection drives, manufacturer take-back kiosks, or authorized recycling facilities. NEVER place in household trash.",
        "preparation_steps": ["Factory reset devices and remove all personal data and SD cards", "Remove detachable batteries and tape battery terminals with electrical tape", "Coil cables neatly for processing"],
        "reuse_ideas": ["Donate working laptops or tablets to schools, community libraries, or non-profits", "Use old smartphones as dedicated smart home remotes or security monitors", "Sell or trade in working devices for refurbished resale"],
        "common_mistakes": ["Throwing lithium batteries into household garbage (responsible for countless sanitation truck fires)", "Dumping old CRT monitors or fluorescent tubes in landfills"],
        "safety_precautions": ["Never dismantle cathode ray tubes or puncture swollen lithium-ion battery packs", "Store damaged batteries in sand or fire-safe metal containers"],
        "local_acceptance_notes": "Requires designated drop-off points. Most major electronics retailers provide free consumer e-waste recycling kiosks.",
        "environmental_impact": "Recycling 1 million laptops saves the energy equivalent to the electricity used by 3,657 homes in a year and recovers valuable gold, silver, and palladium.",
        "icon_name": "cpu"
    },
    {
        "category_key": "textile",
        "title": "Textiles & Clothing",
        "short_description": "Woven fabrics, wearable apparel, footwear, linens, curtains, and clean fabric offcuts.",
        "common_examples": ["Shirts, pants, jackets & sweaters", "Bed sheets, blankets & pillowcases", "Bath towels & washcloths", "Pairs of shoes & belts", "Fabric remnants"],
        "disposal_method": "Donate gently used clothing to charitable thrift organizations. Deposit worn-out textiles in dedicated textile recycling drop bins.",
        "preparation_steps": ["Wash and dry all items thoroughly before donation", "Tie shoe pairs together by their laces", "Separate clean reusable clothes from stained unwearable rags"],
        "reuse_ideas": ["Cut worn t-shirts and old towels into reusable garage and kitchen cleaning rags", "Upcycle denim into tote bags, insulation padding, or patchwork quilts", "Donate blankets and towels to local animal shelters"],
        "common_mistakes": ["Putting clothes in curbside recycling bins (textiles clog recycling machinery shredders)", "Throwing unwearable fabric into general trash instead of textile recycling bins"],
        "safety_precautions": ["Ensure textiles are completely dry before boxing to prevent mildew growth"],
        "local_acceptance_notes": "Not accepted in curbside recycling. Use charity donation bins or specialized clothing drop-boxes.",
        "environmental_impact": "Extending the life of clothes by just 9 months reduces carbon, water, and waste footprints by 20-30%.",
        "icon_name": "shirt"
    },
    {
        "category_key": "general",
        "title": "General Household Waste",
        "short_description": "Residual non-recyclable household materials destined for sanitary landfills or waste-to-energy recovery.",
        "common_examples": ["Composite chip bags & candy wrappers", "Disposable hygiene products & sanitary wipes", "Broken ceramics & earthenware", "Styrofoam takeaway clamshells", "Toothpaste tubes"],
        "disposal_method": "Bag securely in municipal trash bags and place in the black/grey residual waste bin.",
        "preparation_steps": ["Ensure no recyclable paper, metals, or rigid plastics are mixed in", "Double-check for hazardous chemicals or batteries", "Bag dust and small debris to prevent windblown litter during truck tipping"],
        "reuse_ideas": ["Audit your general waste bin to identify single-use items you can replace with durable reusables (e.g. beeswax wraps, cloth wipes, water bottles)", "Embrace package-free grocery shopping"],
        "common_mistakes": ["'Wishcycling': placing non-recyclable items into recycling bins hoping they will be recycled, which contaminates real recyclables", "Placing paint cans or chemical bottles in general trash"],
        "safety_precautions": ["Tie trash bags securely to prevent pest infestation", "Wrap sharp objects (broken mugs) in newspaper before placing in trash bags"],
        "local_acceptance_notes": "Accepted in all standard municipal trash collection schedules.",
        "environmental_impact": "Minimizing residual landfill waste reduces landfill footprint expansion and long-term groundwater pollution risks.",
        "icon_name": "trash-2"
    },
    {
        "category_key": "hazardous",
        "title": "Hazardous Household Waste",
        "short_description": "Chemicals, toxic compounds, corrosive agents, and flammable substances that endanger safety and ecosystems.",
        "common_examples": ["Oil-based paints & wood varnishes", "Pesticides, weedkillers & rodenticides", "Automotive motor oil & coolant", "Drain cleaners, ammonia & bleach", "Mercury thermometers & fluorescent tubes"],
        "disposal_method": "Deliver to municipal Household Hazardous Waste (HHW) drop-off depots or scheduled collection drives.",
        "preparation_steps": ["Keep chemicals in their original labelled containers", "Never mix different chemicals together (mixing bleach and ammonia produces deadly chloramine gas)", "Ensure bottle caps are tightly sealed and transport containers upright in sturdy boxes"],
        "reuse_ideas": ["Donate leftover usable paint to community theater groups, schools, or community housing projects", "Buy only the exact volume of chemical products needed for a project to eliminate leftover surplus"],
        "common_mistakes": ["Pouring motor oil, paint, or solvents down sinks or street storm drains (one quart of motor oil can foul 250,000 gallons of drinking water)", "Throwing chemical bottles into regular trash"],
        "safety_precautions": ["Wear chemical-resistant gloves and safety goggles when handling hazardous waste", "Ensure adequate ventilation in vehicles when transporting chemicals to depots"],
        "local_acceptance_notes": "Strictly prohibited in all curbside trash and recycling programs. Look up your county or city HHW schedule.",
        "environmental_impact": "Proper hazardous waste disposal prevents toxic heavy metals and carcinogenic chemicals from entering groundwater reservoirs and municipal waterways.",
        "icon_name": "alert-triangle"
    }
]

FACILITIES_DATA = [
    {
        "name": "EcoMetro Central Resource Recovery Center",
        "address": "104 Green Industrial Way, Central District",
        "city": "Metropolis",
        "state": "State Central",
        "postal_code": "560001",
        "phone": "+1 (555) 326-7329",
        "email": "metro@recyclesmart.org",
        "website": "https://ecometro.example.org",
        "accepted_materials": ["plastic", "paper", "cardboard", "glass", "metal"],
        "is_verified": True,
        "operating_hours": "Mon-Sat: 08:00 AM - 05:00 PM | Sun: Closed",
        "notes": "Offers drive-through multi-stream drop-off bays. Commercial and residential drop-offs welcome."
    },
    {
        "name": "GreenEarth E-Waste & Electronics Recycling Hub",
        "address": "45 Technology Park Avenue, Suite 12",
        "city": "Metropolis",
        "state": "State Central",
        "postal_code": "560012",
        "phone": "+1 (555) 789-4321",
        "email": "contact@greenearth-ewaste.org",
        "website": "https://greenearth-ewaste.example.org",
        "accepted_materials": ["electronic", "metal"],
        "is_verified": True,
        "operating_hours": "Mon-Fri: 09:00 AM - 06:00 PM | Sat: 10:00 AM - 03:00 PM",
        "notes": "R2-certified data destruction and electronic component recovery. Free residential consumer drop-offs."
    },
    {
        "name": "Community Green Organic & Composting Depot",
        "address": "88 Botanical Park Road, North Ridge",
        "city": "Riverdale",
        "state": "State Central",
        "postal_code": "560045",
        "phone": "+1 (555) 456-1122",
        "email": "soil@riverdalecompost.org",
        "website": "https://riverdalecompost.example.org",
        "accepted_materials": ["organic"],
        "is_verified": True,
        "operating_hours": "Tue-Sun: 07:30 AM - 04:00 PM",
        "notes": "Accepts garden trimmings, food scraps, clean unprinted cardboard. Free compost pickup for local residents."
    },
    {
        "name": "Civic Glass & Metal Reclamation Depot",
        "address": "210 Riverbed Industrial Expressway",
        "city": "Riverdale",
        "state": "State Central",
        "postal_code": "560050",
        "phone": "+1 (555) 888-2940",
        "email": "glassmetal@civicreclaim.org",
        "website": "https://civicreclaim.example.org",
        "accepted_materials": ["glass", "metal", "cardboard"],
        "is_verified": True,
        "operating_hours": "Mon-Fri: 08:30 AM - 04:30 PM",
        "notes": "State-of-the-art optical glass cullet processing. Buys scrap aluminium and copper."
    },
    {
        "name": "County Household Hazardous Waste Collection Center",
        "address": "500 Environmental Safety Blvd",
        "city": "Lakewood",
        "state": "State Central",
        "postal_code": "560088",
        "phone": "+1 (555) 999-5500",
        "email": "hhw@countysafety.gov",
        "website": "https://countysafety.example.gov/hhw",
        "accepted_materials": ["hazardous", "electronic"],
        "is_verified": True,
        "operating_hours": "Wed & Sat: 08:00 AM - 02:00 PM",
        "notes": "Official municipal certified HHW station. Accepts paint, automotive oil, pesticides, and batteries."
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # 1. Seed Recycling Guides
        for g_data in GUIDES_DATA:
            existing = db.query(RecyclingGuide).filter(RecyclingGuide.category_key == g_data["category_key"]).first()
            if not existing:
                guide = RecyclingGuide(**g_data)
                db.add(guide)
        db.commit()
        print("[Seed] Seeded 10 comprehensive recycling guides.")
        
        # 2. Seed Facilities
        for f_data in FACILITIES_DATA:
            existing_fac = db.query(RecyclingFacility).filter(RecyclingFacility.name == f_data["name"]).first()
            if not existing_fac:
                fac = RecyclingFacility(**f_data)
                db.add(fac)
        db.commit()
        print(f"[Seed] Seeded {len(FACILITIES_DATA)} verified recycling facilities.")
        
        # 3. Seed Default Admin
        admin_email = "admin@smartrecycling.org"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                full_name="System Administrator",
                hashed_password=get_password_hash("Admin@123456"),
                role="admin",
                eco_points=500
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"[Seed] Created admin account: {admin_email} (Password: Admin@123456)")
            
        # 4. Seed Demo User
        demo_email = "user@smartrecycling.org"
        demo_user = db.query(User).filter(User.email == demo_email).first()
        if not demo_user:
            demo_user = User(
                email=demo_email,
                full_name="Alex Green",
                hashed_password=get_password_hash("User@123456"),
                role="user",
                eco_points=260
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"[Seed] Created demo user account: {demo_email} (Password: User@123456)")
            
            # Seed demo user challenges
            from app.routers.auth import INITIAL_CHALLENGES
            for ch in INITIAL_CHALLENGES:
                db.add(UserChallenge(
                    user_id=demo_user.id,
                    challenge_code=ch["challenge_code"],
                    title=ch["title"],
                    description=ch["description"],
                    category=ch["category"],
                    target=ch["target"],
                    progress=1 if ch["challenge_code"] == "scan_first_waste" else 0,
                    is_completed=(ch["challenge_code"] == "scan_first_waste"),
                    points_reward=ch["points_reward"]
                ))
                
            # Seed demo user activities
            demo_activities = [
                {
                    "user_id": demo_user.id,
                    "category": "Plastic",
                    "material_type": "HDPE Milk Jugs & PET Bottles",
                    "weight_kg": 2.5,
                    "activity_date": (datetime.date.today() - datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
                    "disposal_method": "Curbside Blue Bin",
                    "notes": "Rinsed and removed caps before disposal",
                    "points_earned": 45
                },
                {
                    "user_id": demo_user.id,
                    "category": "Cardboard",
                    "material_type": "Corrugated Delivery Cartons",
                    "weight_kg": 4.0,
                    "activity_date": (datetime.date.today() - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
                    "disposal_method": "Community Recycling Depot",
                    "notes": "Flattened all 6 boxes",
                    "points_earned": 60
                },
                {
                    "user_id": demo_user.id,
                    "category": "Metal",
                    "material_type": "Aluminium Drink Cans",
                    "weight_kg": 1.2,
                    "activity_date": datetime.date.today().strftime("%Y-%m-%d"),
                    "disposal_method": "Drop-off Center",
                    "notes": "Cleaned beverage cans",
                    "points_earned": 30
                }
            ]
            for act in demo_activities:
                db.add(RecyclingActivity(**act))
                
            db.commit()
            print("[Seed] Seeded initial activities and challenges for demo user.")

    except Exception as e:
        print(f"[Seed] Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
