export type TechnologyCategory = 'production' | 'military' | 'society'
export type TechnologyMetadata = {
  label: string
  category: TechnologyCategory
  era: string
  icon: string
}

export const TECHNOLOGY_METADATA_COUNT = 179

export const TECHNOLOGY_METADATA: Record<string, TechnologyMetadata> = {
  "sericulture": {
    "label": "Sericulture",
    "category": "production",
    "era": "era_1",
    "icon": "sericulture"
  },
  "enclosure": {
    "label": "Enclosure",
    "category": "production",
    "era": "era_1",
    "icon": "enclosure"
  },
  "manufacturies": {
    "label": "Manufacturies",
    "category": "production",
    "era": "era_1",
    "icon": "manufacturies"
  },
  "shaft_mining": {
    "label": "Shaft Mining",
    "category": "production",
    "era": "era_1",
    "icon": "shaft_mining"
  },
  "cotton_gin": {
    "label": "Cotton Gin",
    "category": "production",
    "era": "era_1",
    "icon": "cotton_gin"
  },
  "lathe": {
    "label": "Lathe",
    "category": "production",
    "era": "era_1",
    "icon": "lathe"
  },
  "distillation": {
    "label": "Distillation",
    "category": "production",
    "era": "era_1",
    "icon": "distillation"
  },
  "steelworking": {
    "label": "Steelworking",
    "category": "production",
    "era": "era_1",
    "icon": "steelworking"
  },
  "prospecting": {
    "label": "Prospecting",
    "category": "production",
    "era": "era_1",
    "icon": "prospecting_tech"
  },
  "crystal_glass": {
    "label": "Crystal Glass",
    "category": "production",
    "era": "era_2",
    "icon": "crystal_glass"
  },
  "intensive_agriculture": {
    "label": "Intensive Agriculture",
    "category": "production",
    "era": "era_2",
    "icon": "intensive_agriculture"
  },
  "fractional_distillation": {
    "label": "Fractional Distillation",
    "category": "production",
    "era": "era_2",
    "icon": "fractional_distillation"
  },
  "canneries": {
    "label": "Canneries",
    "category": "production",
    "era": "era_2",
    "icon": "canneries"
  },
  "watertube_boiler": {
    "label": "Water-tube Boiler",
    "category": "production",
    "era": "era_2",
    "icon": "watertube_boiler"
  },
  "atmospheric_engine": {
    "label": "Atmospheric Engine",
    "category": "production",
    "era": "era_2",
    "icon": "atmospheric_engine"
  },
  "railways": {
    "label": "Railways",
    "category": "production",
    "era": "era_2",
    "icon": "railways"
  },
  "chemical_bleaching": {
    "label": "Chemical Bleaching",
    "category": "production",
    "era": "era_2",
    "icon": "chemical_bleaching"
  },
  "nitroglycerin": {
    "label": "Nitroglycerin",
    "category": "production",
    "era": "era_2",
    "icon": "nitroglycerin"
  },
  "bessemer_process": {
    "label": "Bessemer Process",
    "category": "production",
    "era": "era_2",
    "icon": "bessemer_process"
  },
  "baking_powder": {
    "label": "Baking Powder",
    "category": "production",
    "era": "era_2",
    "icon": "baking_powder"
  },
  "mechanized_workshops": {
    "label": "Mechanized Workshops",
    "category": "production",
    "era": "era_2",
    "icon": "mechanized_workshops"
  },
  "mechanical_tools": {
    "label": "Mechanical Tools",
    "category": "production",
    "era": "era_2",
    "icon": "mechanical_tools"
  },
  "improved_fertilizer": {
    "label": "Improved Fertilizer",
    "category": "production",
    "era": "era_3",
    "icon": "improved_fertilizer"
  },
  "steam_donkey": {
    "label": "Steam Donkey",
    "category": "production",
    "era": "era_3",
    "icon": "steam_donkey"
  },
  "dynamite": {
    "label": "Dynamite",
    "category": "production",
    "era": "era_3",
    "icon": "dynamite"
  },
  "rubber_mastication": {
    "label": "Rubber Mastication",
    "category": "production",
    "era": "era_3",
    "icon": "rubber"
  },
  "rotary_valve_engine": {
    "label": "Rotary Valve Engine",
    "category": "production",
    "era": "era_3",
    "icon": "rotary_valve_engine"
  },
  "reinforced_concrete": {
    "label": "Reinforced Concrete",
    "category": "production",
    "era": "era_3",
    "icon": "reinforced_concrete"
  },
  "threshing_machine": {
    "label": "Threshing Machines",
    "category": "production",
    "era": "era_3",
    "icon": "threshing_machine"
  },
  "pumpjacks": {
    "label": "Pumpjacks",
    "category": "production",
    "era": "era_3",
    "icon": "pumpjacks"
  },
  "aniline": {
    "label": "Aniline",
    "category": "production",
    "era": "era_3",
    "icon": "aniline"
  },
  "open_hearth_process": {
    "label": "Open Hearth Process",
    "category": "production",
    "era": "era_3",
    "icon": "open_hearth_process"
  },
  "vulcanization": {
    "label": "Vulcanization",
    "category": "production",
    "era": "era_3",
    "icon": "vulcanization"
  },
  "vacuum_canning": {
    "label": "Vacuum Canning",
    "category": "production",
    "era": "era_3",
    "icon": "vacuum_canning"
  },
  "shift_work": {
    "label": "Shift Work",
    "category": "production",
    "era": "era_3",
    "icon": "shift_work"
  },
  "steel_railway_cars": {
    "label": "Steel Railway Cars",
    "category": "production",
    "era": "era_3",
    "icon": "steel_railway_cars"
  },
  "electrical_generation": {
    "label": "Electrical Generation",
    "category": "production",
    "era": "era_3",
    "icon": "electrical_generation"
  },
  "mechanized_farming": {
    "label": "Mechanized Farming",
    "category": "production",
    "era": "era_4",
    "icon": "mechanized_farming"
  },
  "art_silk": {
    "label": "Art Silk",
    "category": "production",
    "era": "era_4",
    "icon": "art_silk"
  },
  "automatic_bottle_blowers": {
    "label": "Automatic Bottle Blowers",
    "category": "production",
    "era": "era_4",
    "icon": "automatic_bottle_blowers"
  },
  "conveyors": {
    "label": "Conveyors",
    "category": "production",
    "era": "era_4",
    "icon": "conveyers"
  },
  "pasteurization": {
    "label": "Pasteurization",
    "category": "production",
    "era": "era_4",
    "icon": "pasteurization"
  },
  "electric_railway": {
    "label": "Electric Railways",
    "category": "production",
    "era": "era_4",
    "icon": "electric_railway"
  },
  "combustion_engine": {
    "label": "Combustion Engine",
    "category": "production",
    "era": "era_4",
    "icon": "combustion_engine"
  },
  "pneumatic_tools": {
    "label": "Pneumatic Tools",
    "category": "production",
    "era": "era_4",
    "icon": "pneumatic_tools"
  },
  "nitrogen_fixation": {
    "label": "Nitrogen Fixation",
    "category": "production",
    "era": "era_4",
    "icon": "nitrogen_fixation"
  },
  "electric_arc_process": {
    "label": "Electric Arc Process",
    "category": "production",
    "era": "era_4",
    "icon": "electric_arc_process"
  },
  "steam_turbine": {
    "label": "Steam Turbine",
    "category": "production",
    "era": "era_4",
    "icon": "steam_turbines"
  },
  "plastics": {
    "label": "Plastics",
    "category": "production",
    "era": "era_4",
    "icon": "plastics"
  },
  "electrical_capacitors": {
    "label": "Electrical Capacitors",
    "category": "production",
    "era": "era_4",
    "icon": "electrical_capacitors"
  },
  "radio": {
    "label": "Radio",
    "category": "production",
    "era": "era_4",
    "icon": "radio"
  },
  "telephone": {
    "label": "Telephone",
    "category": "production",
    "era": "era_4",
    "icon": "telephone"
  },
  "dough_rollers": {
    "label": "Dough Rollers",
    "category": "production",
    "era": "era_5",
    "icon": "rollers"
  },
  "flash_freezing": {
    "label": "Flash Freezing",
    "category": "production",
    "era": "era_5",
    "icon": "flash_freezing"
  },
  "oil_turbine": {
    "label": "Oil Turbine",
    "category": "production",
    "era": "era_5",
    "icon": "oil_turbines"
  },
  "arc_welding": {
    "label": "Arc Welding",
    "category": "production",
    "era": "era_5",
    "icon": "arc_welding"
  },
  "compression_ignition": {
    "label": "Compression Ignition",
    "category": "production",
    "era": "era_5",
    "icon": "compression_ignition"
  },
  "standing_army": {
    "label": "Standing Army",
    "category": "military",
    "era": "era_1",
    "icon": "standing_army"
  },
  "navigation": {
    "label": "Navigation",
    "category": "military",
    "era": "era_1",
    "icon": "navigation"
  },
  "drydocks": {
    "label": "Drydocks",
    "category": "military",
    "era": "era_1",
    "icon": "drydock"
  },
  "mandatory_service": {
    "label": "Mandatory Service",
    "category": "military",
    "era": "era_1",
    "icon": "mandatory_service"
  },
  "gunsmithing": {
    "label": "Gunsmithing",
    "category": "military",
    "era": "era_1",
    "icon": "gunsmithing"
  },
  "artillery": {
    "label": "Artillery",
    "category": "military",
    "era": "era_1",
    "icon": "artillery"
  },
  "military_drill": {
    "label": "Military Drill",
    "category": "military",
    "era": "era_1",
    "icon": "military_drill"
  },
  "napoleonic_warfare": {
    "label": "Napoleonic Warfare",
    "category": "military",
    "era": "era_1",
    "icon": "napoleonic_warfare"
  },
  "admiralty": {
    "label": "Admiralty",
    "category": "military",
    "era": "era_1",
    "icon": "admiralty"
  },
  "army_reserves": {
    "label": "Army Reserves",
    "category": "military",
    "era": "era_1",
    "icon": "army_reserves"
  },
  "line_infantry": {
    "label": "Line Infantry",
    "category": "military",
    "era": "era_1",
    "icon": "line_infantry"
  },
  "paddle_steamer": {
    "label": "Paddle Steamer",
    "category": "military",
    "era": "era_1",
    "icon": "paddle_steamer"
  },
  "field_works": {
    "label": "Field Works",
    "category": "military",
    "era": "era_2",
    "icon": "field_works"
  },
  "logistics": {
    "label": "Logistics",
    "category": "military",
    "era": "era_2",
    "icon": "logistics_tech"
  },
  "triage": {
    "label": "Triage",
    "category": "military",
    "era": "era_2",
    "icon": "triage"
  },
  "shell_gun": {
    "label": "Shell Gun",
    "category": "military",
    "era": "era_2",
    "icon": "shell_gun"
  },
  "percussion_cap": {
    "label": "Percussion Cap",
    "category": "military",
    "era": "era_2",
    "icon": "percussion_cap"
  },
  "rifling": {
    "label": "Rifling",
    "category": "military",
    "era": "era_2",
    "icon": "rifling"
  },
  "general_staff": {
    "label": "General Staff",
    "category": "military",
    "era": "era_2",
    "icon": "general_staff"
  },
  "screw_frigate": {
    "label": "Screw Frigate",
    "category": "military",
    "era": "era_2",
    "icon": "screw_frigate"
  },
  "power_of_the_purse": {
    "label": "Power of the Purse",
    "category": "military",
    "era": "era_2",
    "icon": "power_of_the_purse"
  },
  "hydraulic_cranes": {
    "label": "Hydraulic Cranes",
    "category": "military",
    "era": "era_2",
    "icon": "hydraulic_cranes"
  },
  "modern_nursing": {
    "label": "Modern Nursing",
    "category": "military",
    "era": "era_3",
    "icon": "modern_nursing"
  },
  "enlistment_offices": {
    "label": "Enlistment Offices",
    "category": "military",
    "era": "era_3",
    "icon": "enlistment_offices"
  },
  "electric_telegraph": {
    "label": "Electric Telegraph",
    "category": "military",
    "era": "era_3",
    "icon": "electrical_telegraph"
  },
  "military_statistics": {
    "label": "Military Statistics",
    "category": "military",
    "era": "era_3",
    "icon": "military_statistics"
  },
  "repeaters": {
    "label": "Repeaters",
    "category": "military",
    "era": "era_3",
    "icon": "repeaters"
  },
  "breech_loading_artillery": {
    "label": "Breech-Loading Artillery",
    "category": "military",
    "era": "era_3",
    "icon": "breech_loading_artillery"
  },
  "handcranked_machine_gun": {
    "label": "Handcranked Machine Gun",
    "category": "military",
    "era": "era_3",
    "icon": "handcranked_machine_gun"
  },
  "self_propelled_torpedoes": {
    "label": "Self-Propelled Torpedoes",
    "category": "military",
    "era": "era_3",
    "icon": "self_propelled_torpedoes"
  },
  "monitor_tech": {
    "label": "$ship_type_modern_ironclad$",
    "category": "military",
    "era": "era_3",
    "icon": "monitor_tech"
  },
  "ironclad_tech": {
    "label": "Ironclad",
    "category": "military",
    "era": "era_3",
    "icon": "ironclad_tech"
  },
  "jeune_ecole": {
    "label": "Jeune École",
    "category": "military",
    "era": "era_3",
    "icon": "jeune_ecole"
  },
  "floating_harbor": {
    "label": "Floating Harbor",
    "category": "military",
    "era": "era_3",
    "icon": "floating_harbor"
  },
  "gantry_cranes": {
    "label": "Gantry Cranes",
    "category": "military",
    "era": "era_3",
    "icon": "gantry_crane"
  },
  "trench_works": {
    "label": "Trench Works",
    "category": "military",
    "era": "era_4",
    "icon": "trench_works"
  },
  "war_propaganda": {
    "label": "War Propaganda",
    "category": "military",
    "era": "era_4",
    "icon": "war_propaganda"
  },
  "wargaming": {
    "label": "Wargaming",
    "category": "military",
    "era": "era_4",
    "icon": "wargaming"
  },
  "defense_in_depth": {
    "label": "Defense in Depth",
    "category": "military",
    "era": "era_4",
    "icon": "defense_in_depth"
  },
  "bolt_action_rifles": {
    "label": "Bolt-Action Rifle",
    "category": "military",
    "era": "era_4",
    "icon": "bolt_action_rifles"
  },
  "automatic_machine_guns": {
    "label": "Automatic Machine Guns",
    "category": "military",
    "era": "era_4",
    "icon": "machine_gun"
  },
  "submarine": {
    "label": "Submarine",
    "category": "military",
    "era": "era_4",
    "icon": "submarine"
  },
  "destroyer": {
    "label": "Destroyer",
    "category": "military",
    "era": "era_5",
    "icon": "destroyers"
  },
  "pre_dreadnought_tech": {
    "label": "$ship_type_pre_dreadnought$",
    "category": "military",
    "era": "era_4",
    "icon": "pre_dreadnought"
  },
  "dreadnought_tech": {
    "label": "Dreadnought",
    "category": "military",
    "era": "era_4",
    "icon": "dreadnought"
  },
  "sea_lane_strategies": {
    "label": "Sea Lane Strategies",
    "category": "military",
    "era": "era_4",
    "icon": "sea_lane_strategies"
  },
  "landing_craft": {
    "label": "Landing Craft",
    "category": "military",
    "era": "era_4",
    "icon": "landing_craft"
  },
  "concrete_dockyards": {
    "label": "Concrete Dockyards",
    "category": "military",
    "era": "era_4",
    "icon": "concrete_dockyards"
  },
  "nco_training": {
    "label": "NCO Training",
    "category": "military",
    "era": "era_5",
    "icon": "nco_training"
  },
  "chemical_warfare": {
    "label": "Chemical Warfare",
    "category": "military",
    "era": "era_5",
    "icon": "chemical_warfare"
  },
  "stormtroopers": {
    "label": "Stormtroopers",
    "category": "military",
    "era": "era_5",
    "icon": "stormtroopers"
  },
  "concrete_fortifications": {
    "label": "Concrete Fortifications",
    "category": "military",
    "era": "era_5",
    "icon": "concrete_fortifications"
  },
  "mobile_armor": {
    "label": "Mobile Armor",
    "category": "military",
    "era": "era_5",
    "icon": "mobile_armor"
  },
  "military_aviation": {
    "label": "Military Aviation",
    "category": "military",
    "era": "era_5",
    "icon": "military_aviation"
  },
  "flamethrowers": {
    "label": "Flamethrowers",
    "category": "military",
    "era": "era_5",
    "icon": "flamethrowers"
  },
  "carrier_tech": {
    "label": "Aircraft Carrier",
    "category": "military",
    "era": "era_5",
    "icon": "carrier_tech"
  },
  "battleship_tech": {
    "label": "$ship_type_super_dreadnought$",
    "category": "military",
    "era": "era_5",
    "icon": "battleship_tech"
  },
  "battlefleet_tactics": {
    "label": "Modern Battlefleet Tactics",
    "category": "military",
    "era": "era_5",
    "icon": "battlefleet_tactics"
  },
  "urbanization": {
    "label": "Urbanization",
    "category": "society",
    "era": "era_1",
    "icon": "urbanization"
  },
  "urban_planning": {
    "label": "Urban Planning",
    "category": "society",
    "era": "era_1",
    "icon": "urban_planning"
  },
  "rationalism": {
    "label": "Rationalism",
    "category": "society",
    "era": "era_1",
    "icon": "rationalism"
  },
  "tech_bureaucracy": {
    "label": "Bureaucracy",
    "category": "society",
    "era": "era_1",
    "icon": "bureaucracy"
  },
  "currency_standards": {
    "label": "Currency Standards",
    "category": "society",
    "era": "era_1",
    "icon": "currency_standards"
  },
  "democracy": {
    "label": "Democracy",
    "category": "society",
    "era": "era_1",
    "icon": "democracy"
  },
  "romanticism": {
    "label": "Romanticism",
    "category": "society",
    "era": "era_1",
    "icon": "romanticism"
  },
  "international_trade": {
    "label": "International Trade",
    "category": "society",
    "era": "era_1",
    "icon": "international_trade"
  },
  "centralization": {
    "label": "Centralization",
    "category": "society",
    "era": "era_1",
    "icon": "centralization"
  },
  "corporate_charters": {
    "label": "Corporate Charters",
    "category": "society",
    "era": "era_2",
    "icon": "corporate_charters"
  },
  "banking": {
    "label": "Banking",
    "category": "society",
    "era": "era_1",
    "icon": "banking"
  },
  "academia": {
    "label": "Academia",
    "category": "society",
    "era": "era_1",
    "icon": "academia"
  },
  "colonization": {
    "label": "Colonization",
    "category": "society",
    "era": "era_1",
    "icon": "colonization"
  },
  "international_relations": {
    "label": "International Relations",
    "category": "society",
    "era": "era_1",
    "icon": "international_diplomacy"
  },
  "law_enforcement": {
    "label": "Law Enforcement",
    "category": "society",
    "era": "era_1",
    "icon": "law_enforcement"
  },
  "stock_exchange": {
    "label": "Stock Exchange",
    "category": "society",
    "era": "era_1",
    "icon": "stock_exchanges"
  },
  "medical_degrees": {
    "label": "Medical Degrees",
    "category": "society",
    "era": "era_1",
    "icon": "medical_degrees"
  },
  "mass_communication": {
    "label": "Mass Communication",
    "category": "society",
    "era": "era_1",
    "icon": "mass_communication"
  },
  "empiricism": {
    "label": "Empiricism",
    "category": "society",
    "era": "era_1",
    "icon": "empiricism"
  },
  "egalitarianism": {
    "label": "Egalitarianism",
    "category": "society",
    "era": "era_2",
    "icon": "egalitarianism"
  },
  "pharmaceuticals": {
    "label": "Pharmaceuticals",
    "category": "society",
    "era": "era_2",
    "icon": "pharmaceuticals"
  },
  "modern_sewerage": {
    "label": "Modern Sewerage",
    "category": "society",
    "era": "era_2",
    "icon": "modern_sewerage"
  },
  "quinine": {
    "label": "Quinine",
    "category": "society",
    "era": "era_2",
    "icon": "quinine"
  },
  "organized_sports": {
    "label": "Organized Sports",
    "category": "society",
    "era": "era_2",
    "icon": "organized_sports"
  },
  "central_archives": {
    "label": "Central Archives",
    "category": "society",
    "era": "era_2",
    "icon": "central_archives"
  },
  "central_banking": {
    "label": "Central Banking",
    "category": "society",
    "era": "era_2",
    "icon": "central_banking"
  },
  "joint_stock_companies": {
    "label": "Joint-Stock Companies",
    "category": "society",
    "era": "era_2",
    "icon": "joint_stock_companies"
  },
  "dialectics": {
    "label": "Dialectics",
    "category": "society",
    "era": "era_2",
    "icon": "dialectics"
  },
  "psychiatry": {
    "label": "Psychiatry",
    "category": "society",
    "era": "era_2",
    "icon": "psychiatry"
  },
  "realism": {
    "label": "Realism",
    "category": "society",
    "era": "era_2",
    "icon": "realism"
  },
  "nationalism": {
    "label": "Nationalism",
    "category": "society",
    "era": "era_2",
    "icon": "nationalism"
  },
  "labor_movement": {
    "label": "Labor Movement",
    "category": "society",
    "era": "era_2",
    "icon": "labor_movement"
  },
  "postal_savings": {
    "label": "Postal Savings",
    "category": "society",
    "era": "era_2",
    "icon": "postal_savings"
  },
  "human_rights": {
    "label": "Human Rights",
    "category": "society",
    "era": "era_3",
    "icon": "human_rights"
  },
  "feminism": {
    "label": "Feminism",
    "category": "society",
    "era": "era_3",
    "icon": "feminism"
  },
  "steel_frame_buildings": {
    "label": "Steel-Frame Buildings",
    "category": "society",
    "era": "era_3",
    "icon": "steel_frame_buildings"
  },
  "civilizing_mission": {
    "label": "Civilizing Mission",
    "category": "society",
    "era": "era_3",
    "icon": "civilizing_mission"
  },
  "anarchism": {
    "label": "Anarchism",
    "category": "society",
    "era": "era_3",
    "icon": "anarchy"
  },
  "socialism": {
    "label": "Socialism",
    "category": "society",
    "era": "era_3",
    "icon": "socialism"
  },
  "corporatism": {
    "label": "Corporatism",
    "category": "society",
    "era": "era_3",
    "icon": "corporatism"
  },
  "pan-nationalism": {
    "label": "Pan-nationalism",
    "category": "society",
    "era": "era_3",
    "icon": "pan_nationalism"
  },
  "mutual_funds": {
    "label": "Mutual Funds",
    "category": "society",
    "era": "era_3",
    "icon": "mutual_funds"
  },
  "investment_banks": {
    "label": "Investment Banks",
    "category": "society",
    "era": "era_3",
    "icon": "investment_banks"
  },
  "camera": {
    "label": "Camera",
    "category": "society",
    "era": "era_3",
    "icon": "camera"
  },
  "philosophical_pragmatism": {
    "label": "Philosophical Pragmatism",
    "category": "society",
    "era": "era_3",
    "icon": "philosophical_pragmatism"
  },
  "identification_documents": {
    "label": "Identification Documents",
    "category": "society",
    "era": "era_3",
    "icon": "identification_documents"
  },
  "elevator": {
    "label": "Elevators",
    "category": "society",
    "era": "era_4",
    "icon": "elevator"
  },
  "zeppelins": {
    "label": "Zeppelins",
    "category": "society",
    "era": "era_4",
    "icon": "zeppelins"
  },
  "malaria_prevention": {
    "label": "Malaria Prevention",
    "category": "society",
    "era": "era_4",
    "icon": "malaria_prevention"
  },
  "central_planning": {
    "label": "Central Planning",
    "category": "society",
    "era": "era_4",
    "icon": "central_planning"
  },
  "political_agitation": {
    "label": "Political Agitation",
    "category": "society",
    "era": "era_4",
    "icon": "political_agitation"
  },
  "international_exchange_standards": {
    "label": "International Exchange Standards",
    "category": "society",
    "era": "era_4",
    "icon": "international_exchange_standards"
  },
  "corporate_management": {
    "label": "Corporate Governance",
    "category": "society",
    "era": "era_4",
    "icon": "corporate_management"
  },
  "psychoanalysis": {
    "label": "Psychoanalysis",
    "category": "society",
    "era": "era_4",
    "icon": "psychoanalysis"
  },
  "film": {
    "label": "Film",
    "category": "society",
    "era": "era_4",
    "icon": "film"
  },
  "multilateral_alliances": {
    "label": "Multilateral Alliances",
    "category": "society",
    "era": "era_4",
    "icon": "multilateral_alliances"
  },
  "mass_surveillance": {
    "label": "Mass Surveillance",
    "category": "society",
    "era": "era_5",
    "icon": "mass_surveillance"
  },
  "antibiotics": {
    "label": "Antibiotics",
    "category": "society",
    "era": "era_5",
    "icon": "antibiotics"
  },
  "mass_propaganda": {
    "label": "Mass Propaganda",
    "category": "society",
    "era": "era_5",
    "icon": "mass_propaganda"
  },
  "modern_financial_instruments": {
    "label": "Modern Financial Instruments",
    "category": "society",
    "era": "era_5",
    "icon": "modern_financial_instruments"
  },
  "macroeconomics": {
    "label": "Macroeconomics",
    "category": "society",
    "era": "era_5",
    "icon": "macroeconomics"
  },
  "behaviorism": {
    "label": "Behaviorism",
    "category": "society",
    "era": "era_5",
    "icon": "behaviorism"
  },
  "analytical_philosophy": {
    "label": "Analytical Philosophy",
    "category": "society",
    "era": "era_5",
    "icon": "analytical_philosophy"
  },
  "paved_roads": {
    "label": "Paved Roads",
    "category": "society",
    "era": "era_5",
    "icon": "paved_roads"
  }
}
