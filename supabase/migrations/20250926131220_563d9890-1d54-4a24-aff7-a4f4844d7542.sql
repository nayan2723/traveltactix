-- Insert comprehensive places data for India
INSERT INTO places (name, description, category, city, country, latitude, longitude, is_hidden_gem, cultural_tips) VALUES

-- Delhi
('Red Fort (Lal Qila)', 'Historic Mughal fortress in Old Delhi, UNESCO World Heritage Site', 'historical', 'Delhi', 'India', 28.6562, 77.2410, false, '{"tips": ["Visit during evening for beautiful lighting", "Audio guides available in multiple languages"]}'),
('India Gate', 'War memorial arch commemorating 70,000 Indian soldiers', 'monument', 'Delhi', 'India', 28.6129, 77.2295, false, '{"tips": ["Best visited in the evening when lit up", "Perfect for picnics in the surrounding lawns"]}'),
('Qutub Minar', 'Tallest brick minaret in the world, UNESCO World Heritage Site', 'historical', 'Delhi', 'India', 28.5245, 77.1855, false, '{"tips": ["Climb early morning to avoid crowds", "Explore the surrounding Qutub complex"]}'),
('Lotus Temple', 'Bahai House of Worship shaped like a lotus flower', 'religious', 'Delhi', 'India', 28.5535, 77.2588, false, '{"tips": ["Maintain silence inside", "Free entry for all visitors"]}'),
('Chandni Chowk', 'Historic walled city area known for street food and markets', 'market', 'Delhi', 'India', 28.6506, 77.2303, false, '{"tips": ["Try paranthe wali gali for authentic food", "Best explored on foot or by rickshaw"]}'),

-- Mumbai
('Gateway of India', 'Iconic arch monument overlooking the Arabian Sea', 'monument', 'Mumbai', 'India', 18.9220, 72.8347, false, '{"tips": ["Take a boat ride to Elephanta Caves from here", "Beautiful sunset views"]}'),
('Marine Drive', 'Crescent-shaped promenade along the coast, also called Queens Necklace', 'waterfront', 'Mumbai', 'India', 18.9439, 72.8238, false, '{"tips": ["Visit during sunset for spectacular views", "Evening walk is refreshing"]}'),
('Chhatrapati Shivaji Terminus', 'Victorian Gothic railway station, UNESCO World Heritage Site', 'historical', 'Mumbai', 'India', 18.9398, 72.8355, false, '{"tips": ["Marvel at the architecture during less busy hours", "Photography allowed from outside"]}'),
('Dharavi Slum', 'One of Asias largest slums, now a thriving community', 'cultural', 'Mumbai', 'India', 19.0370, 72.8570, true, '{"tips": ["Take guided tours only", "Respect local customs and privacy"]}'),
('Juhu Beach', 'Popular beach known for street food and Bollywood star homes', 'beach', 'Mumbai', 'India', 19.0883, 72.8264, false, '{"tips": ["Try bhel puri and pav bhaji", "Best time is evening"]}'),

-- Jaipur
('Hawa Mahal', 'Palace of Winds with 953 windows, iconic pink sandstone architecture', 'palace', 'Jaipur', 'India', 26.9239, 75.8267, false, '{"tips": ["Best photographed from the street opposite", "Visit early morning for soft lighting"]}'),
('Amber Fort', 'Hilltop fort with stunning architecture and elephant rides', 'fort', 'Jaipur', 'India', 26.9855, 75.8513, false, '{"tips": ["Take elephant ride or jeep to reach the top", "Evening light show is spectacular"]}'),
('City Palace', 'Royal residence complex with museums and courtyards', 'palace', 'Jaipur', 'India', 26.9255, 75.8235, false, '{"tips": ["Allow half day for complete exploration", "Photography rules vary by section"]}'),
('Jantar Mantar', 'UNESCO World Heritage astronomical observatory', 'historical', 'Jaipur', 'India', 26.9247, 75.8249, false, '{"tips": ["Hire a guide to understand the instruments", "Best visited during clear weather"]}'),
('Nahargarh Fort', 'Hilltop fort offering panoramic views of Jaipur', 'fort', 'Jaipur', 'India', 26.9341, 75.8155, false, '{"tips": ["Perfect for sunset views", "Restaurant inside offers great dining with a view"]}'),

-- Agra
('Taj Mahal', 'Iconic white marble mausoleum, UNESCO World Heritage Site', 'monument', 'Agra', 'India', 27.1751, 78.0421, false, '{"tips": ["Visit at sunrise for golden lighting", "Friday closed for general public"]}'),
('Agra Fort', 'Red sandstone fort complex, UNESCO World Heritage Site', 'fort', 'Agra', 'India', 27.1795, 78.0211, false, '{"tips": ["Combine with Taj Mahal visit", "Allow 2-3 hours for complete tour"]}'),
('Mehtab Bagh', 'Garden complex offering rear view of Taj Mahal', 'garden', 'Agra', 'India', 27.1738, 78.0428, true, '{"tips": ["Perfect for sunset photos of Taj Mahal", "Less crowded than main Taj viewing areas"]}'),
('Itimad-ud-Daulah', 'Baby Taj - elegant marble tomb with intricate inlay work', 'monument', 'Agra', 'India', 27.1863, 78.0262, true, '{"tips": ["Often called Baby Taj", "Much less crowded than main Taj"]}'),

-- Goa
('Baga Beach', 'Popular beach known for water sports and nightlife', 'beach', 'Panaji', 'India', 15.5560, 73.7516, false, '{"tips": ["Try water sports like parasailing", "Great nightlife and beach shacks"]}'),
('Old Goa Churches', 'Historic churches including Basilica of Bom Jesus', 'religious', 'Panaji', 'India', 15.5007, 73.9112, false, '{"tips": ["Dress modestly when visiting churches", "Rich Portuguese colonial architecture"]}'),
('Dudhsagar Falls', 'Four-tiered waterfall on the Mandovi River', 'nature', 'Panaji', 'India', 15.3144, 74.3144, false, '{"tips": ["Best visited during monsoon season", "Trek or jeep safari required to reach"]}'),
('Anjuna Flea Market', 'Wednesday market famous for hippie culture and souvenirs', 'market', 'Panaji', 'India', 15.5732, 73.7443, false, '{"tips": ["Only open on Wednesdays", "Bargaining is expected"]}'),
('Fort Aguada', '17th-century Portuguese fort with lighthouse', 'fort', 'Panaji', 'India', 15.4952, 73.7734, false, '{"tips": ["Great sunset views", "Combines history with scenic beauty"]}'),

-- Kerala - Kochi
('Chinese Fishing Nets', 'Iconic cantilevered fishing nets at Fort Kochi', 'cultural', 'Kochi', 'India', 9.9648, 76.2415, false, '{"tips": ["Best photographed during sunset", "Watch fishermen demonstrate the mechanism"]}'),
('Mattancherry Palace', 'Portuguese palace with Kerala murals and artifacts', 'palace', 'Kochi', 'India', 9.9579, 76.2604, false, '{"tips": ["Also called Dutch Palace", "Famous for traditional Kerala murals"]}'),
('St. Francis Church', 'Oldest European church in India', 'religious', 'Kochi', 'India', 9.9657, 76.2420, false, '{"tips": ["Vasco da Gama was originally buried here", "Simple but historically significant"]}'),
('Jew Town', 'Historic area with antique shops and synagogue', 'cultural', 'Kochi', 'India', 9.9575, 76.2615, true, '{"tips": ["Visit the 400-year-old synagogue", "Browse antique shops for unique finds"]}'),

-- Kerala - Alleppey
('Alleppey Backwaters', 'Network of lagoons and lakes perfect for houseboat cruises', 'nature', 'Alleppey', 'India', 9.4981, 76.3388, false, '{"tips": ["Book houseboat for overnight experience", "Best from October to March"]}'),
('Alleppey Beach', 'Pristine beach with lighthouse and pier', 'beach', 'Alleppey', 'India', 9.4747, 76.3264, false, '{"tips": ["Watch traditional snake boat races", "Beautiful lighthouse views"]}'),

-- Rajasthan - Udaipur
('City Palace Udaipur', 'Largest palace complex in Rajasthan overlooking Lake Pichola', 'palace', 'Udaipur', 'India', 24.5761, 73.6834, false, '{"tips": ["Stunning lake views from palace", "Museum has royal artifacts"]}'),
('Lake Pichola', 'Artificial lake with island palaces and boat rides', 'nature', 'Udaipur', 'India', 24.5711, 73.6804, false, '{"tips": ["Sunset boat rides are magical", "View floating palaces from water"]}'),
('Jag Mandir', 'Island palace on Lake Pichola known as Lake Garden Palace', 'palace', 'Udaipur', 'India', 24.5696, 73.6792, false, '{"tips": ["Accessible only by boat", "Perfect for romantic dinners"]}'),

-- Rajasthan - Jodhpur
('Mehrangarh Fort', 'One of Indias largest forts with museum and panoramic views', 'fort', 'Jodhpur', 'India', 26.2971, 73.0187, false, '{"tips": ["Take the zip line for adventure", "Audio guide highly recommended"]}'),
('Jaswant Thada', 'White marble cenotaph known as Taj Mahal of Marwar', 'monument', 'Jodhpur', 'India', 26.2958, 73.0159, false, '{"tips": ["Beautiful marble lattice work", "Peaceful gardens around the memorial"]}'),
('Blue City Walking Tour', 'Explore the blue-painted houses of old Jodhpur', 'cultural', 'Jodhpur', 'India', 26.2893, 73.0240, false, '{"tips": ["Early morning light is best for photos", "Respect local privacy when photographing"]}'),

-- Karnataka - Bangalore
('Lalbagh Botanical Garden', '240-acre botanical garden with glass house and rare plants', 'nature', 'Bangalore', 'India', 12.9507, 77.5848, false, '{"tips": ["Visit during flower shows", "Morning hours are less crowded"]}'),
('Bangalore Palace', 'Tudor-style palace with Gothic windows and woodwork', 'palace', 'Bangalore', 'India', 12.9982, 77.5915, false, '{"tips": ["Audio guide explains royal history", "Beautiful architecture and artifacts"]}'),
('Cubbon Park', 'Historic park in the heart of the city with Government buildings', 'nature', 'Bangalore', 'India', 12.9716, 77.5946, false, '{"tips": ["Great for morning jogs", "Free entry and well maintained"]}'),

-- Tamil Nadu - Chennai
('Marina Beach', 'One of the longest urban beaches in the world', 'beach', 'Chennai', 'India', 13.0487, 80.2825, false, '{"tips": ["Evening is best time to visit", "Try local street food"]}'),
('Kapaleeshwarar Temple', 'Ancient Dravidian architecture temple dedicated to Lord Shiva', 'religious', 'Chennai', 'India', 13.0338, 80.2691, false, '{"tips": ["Remove shoes before entering", "Beautiful architecture and sculptures"]}'),

-- West Bengal - Kolkata
('Victoria Memorial', 'White marble memorial museum in Indo-Saracenic architecture', 'monument', 'Kolkata', 'India', 22.5448, 88.3426, false, '{"tips": ["Light and sound show in evenings", "Museum has British-era artifacts"]}'),
('Howrah Bridge', 'Iconic cantilever bridge over Hooghly River', 'monument', 'Kolkata', 'India', 22.5958, 88.3468, false, '{"tips": ["Best viewed from Millennium Park", "Early morning photos avoid crowds"]}'),
('Dakshineswar Kali Temple', 'Famous temple where Ramakrishna worshipped', 'religious', 'Kolkata', 'India', 22.6552, 88.3576, false, '{"tips": ["Very crowded during festivals", "Take ferry across Ganges for scenic approach"]}'),

-- Himachal Pradesh - Shimla
('Mall Road Shimla', 'Main pedestrian street with colonial architecture and shops', 'cultural', 'Shimla', 'India', 31.1048, 77.1734, false, '{"tips": ["No vehicles allowed", "Perfect for evening strolls"]}'),
('Jakhu Temple', 'Hilltop temple dedicated to Hanuman with city views', 'religious', 'Shimla', 'India', 31.1079, 77.1718, false, '{"tips": ["Steep climb but worth the view", "Watch out for monkeys"]}'),

-- Himachal Pradesh - Manali
('Rohtang Pass', 'High mountain pass with snow and adventure sports', 'nature', 'Manali', 'India', 32.2500, 77.2500, false, '{"tips": ["Permits required", "Best visited May to October"]}'),
('Solang Valley', 'Valley famous for adventure sports and scenic beauty', 'nature', 'Manali', 'India', 32.3076, 77.1504, false, '{"tips": ["Try paragliding and skiing", "Ropeway offers great views"]}'),

-- Uttarakhand - Rishikesh
('Laxman Jhula', 'Suspension bridge over Ganges with spiritual significance', 'religious', 'Rishikesh', 'India', 30.1265, 78.3294, false, '{"tips": ["Famous pilgrimage site", "Connects to many ashrams"]}'),
('Beatles Ashram', 'Abandoned ashram where Beatles stayed in 1968', 'cultural', 'Rishikesh', 'India', 30.1434, 78.3097, true, '{"tips": ["Now has beautiful graffiti art", "Meditation and yoga center"]}'),

-- Gujarat - Ahmedabad
('Sabarmati Ashram', 'Gandhis residence during independence movement', 'historical', 'Ahmedabad', 'India', 23.0615, 72.5809, false, '{"tips": ["Learn about Gandhis life and philosophy", "Museum has interesting artifacts"]}'),
('Adalaj Stepwell', 'Intricately carved stepwell with Indo-Islamic architecture', 'historical', 'Ahmedabad', 'India', 23.1613, 72.5821, false, '{"tips": ["Beautiful stone carvings", "Cool relief from heat"]}');

-- Insert comprehensive missions data for India (using correct case for difficulty)
INSERT INTO missions (title, description, category, difficulty, xp_reward, city, country, deadline, latitude, longitude) VALUES

-- Delhi Missions
('Explore Old Delhi Heritage Walk', 'Visit 3 historical sites in Old Delhi including Red Fort, Jama Masjid, and Chandni Chowk market', 'cultural', 'Medium', 150, 'Delhi', 'India', '2025-12-31 23:59:59', 28.6506, 77.2303),
('Try 5 Street Foods in Chandni Chowk', 'Taste authentic Delhi street food including paranthe, chaat, kulfi, jalebi, and lassi', 'food', 'Easy', 100, 'Delhi', 'India', '2025-12-31 23:59:59', 28.6506, 77.2303),
('Delhi Metro Cultural Journey', 'Use Delhi Metro to visit 4 different cultural sites across the city in one day', 'transportation', 'Medium', 120, 'Delhi', 'India', '2025-12-31 23:59:59', 28.6139, 77.2090),
('Sunset at India Gate', 'Watch sunset at India Gate and take photos with the monument during golden hour', 'photography', 'Easy', 80, 'Delhi', 'India', '2025-12-31 23:59:59', 28.6129, 77.2295),
('Discover Hidden Gems of Hauz Khas', 'Explore Hauz Khas Village, visit the deer park, monuments, and trendy cafes', 'exploration', 'Medium', 130, 'Delhi', 'India', '2025-12-31 23:59:59', 28.5494, 77.2001),

-- Mumbai Missions
('Mumbai Street Food Safari', 'Try 5 iconic Mumbai foods: vada pav, bhel puri, pav bhaji, dosa, and kulfi', 'food', 'Easy', 120, 'Mumbai', 'India', '2025-12-31 23:59:59', 18.9220, 72.8347),
('Local Train Adventure', 'Take Mumbai local train during rush hour and experience the citys lifeline', 'transportation', 'Medium', 100, 'Mumbai', 'India', '2025-12-31 23:59:59', 18.9398, 72.8355),
('Bollywood Studio Tour', 'Visit Film City or take a Bollywood tour to see movie sets and studios', 'entertainment', 'Medium', 150, 'Mumbai', 'India', '2025-12-31 23:59:59', 19.1136, 72.8697),
('Slum Tourism with Purpose', 'Take a responsible guided tour of Dharavi to understand urban development', 'social', 'Hard', 200, 'Mumbai', 'India', '2025-12-31 23:59:59', 19.0370, 72.8570),
('Marine Drive Sunset Walk', 'Walk the entire length of Marine Drive during sunset for Queens Necklace view', 'nature', 'Easy', 90, 'Mumbai', 'India', '2025-12-31 23:59:59', 18.9439, 72.8238),

-- Jaipur Missions  
('Pink City Photography Challenge', 'Capture 10 beautiful photos showcasing Jaipurs pink architecture', 'photography', 'Medium', 130, 'Jaipur', 'India', '2025-12-31 23:59:59', 26.9124, 75.7873),
('Rajasthani Cuisine Quest', 'Try 5 traditional dishes: dal baati churma, ghewar, pyaaz kachori, laal maas, and kulfi', 'food', 'Medium', 140, 'Jaipur', 'India', '2025-12-31 23:59:59', 26.9124, 75.7873),
('Palace Hopping Adventure', 'Visit 3 palaces in one day: Hawa Mahal, City Palace, and Amber Fort', 'historical', 'Hard', 200, 'Jaipur', 'India', '2025-12-31 23:59:59', 26.9239, 75.8267),
('Jaipur Handicraft Trail', 'Shop for blue pottery, textiles, and jewelry in traditional markets', 'shopping', 'Medium', 120, 'Jaipur', 'India', '2025-12-31 23:59:59', 26.9124, 75.7873),
('Elephant Experience at Amber', 'Take an elephant ride up to Amber Fort and learn about elephant care', 'adventure', 'Medium', 150, 'Jaipur', 'India', '2025-12-31 23:59:59', 26.9855, 75.8513),

-- Agra Missions
('Taj Mahal Sunrise Mission', 'Wake up early to witness the Taj Mahal at sunrise with golden lighting', 'photography', 'Easy', 150, 'Agra', 'India', '2025-12-31 23:59:59', 27.1751, 78.0421),
('Mughal Architecture Trail', 'Visit all 3 UNESCO sites in Agra: Taj Mahal, Agra Fort, and Fatehpur Sikri', 'historical', 'Hard', 250, 'Agra', 'India', '2025-12-31 23:59:59', 27.1751, 78.0421),
('Agra Food Heritage Walk', 'Try petha, bedai, and other local Agra delicacies from traditional shops', 'food', 'Easy', 90, 'Agra', 'India', '2025-12-31 23:59:59', 27.1767, 78.0081),
('Marble Inlay Workshop', 'Learn the traditional art of marble inlay work from local artisans', 'cultural', 'Medium', 160, 'Agra', 'India', '2025-12-31 23:59:59', 27.1767, 78.0081),
('Mehtab Bagh Sunset', 'Watch sunset view of Taj Mahal from Mehtab Bagh gardens across the river', 'nature', 'Easy', 80, 'Agra', 'India', '2025-12-31 23:59:59', 27.1738, 78.0428),

-- Goa Missions
('Beach Hopping Goa Style', 'Visit 4 different beaches: Baga, Anjuna, Calangute, and Palolem in one day', 'beach', 'Medium', 140, 'Panaji', 'India', '2025-12-31 23:59:59', 15.4909, 73.8278),
('Portuguese Heritage Trail', 'Explore Old Goa churches and Portuguese colonial architecture', 'historical', 'Medium', 130, 'Panaji', 'India', '2025-12-31 23:59:59', 15.5007, 73.9112),
('Goan Cuisine Experience', 'Try 5 traditional Goan dishes: fish curry rice, bebinca, feni, vindaloo, and xacuti', 'food', 'Easy', 120, 'Panaji', 'India', '2025-12-31 23:59:59', 15.4909, 73.8278),
('Dudhsagar Waterfall Trek', 'Trek to the magnificent four-tiered Dudhsagar Falls', 'adventure', 'Hard', 200, 'Panaji', 'India', '2025-12-31 23:59:59', 15.3144, 74.3144),
('Flea Market Treasure Hunt', 'Find 5 unique items at Anjuna or Saturday Night Market', 'shopping', 'Easy', 90, 'Panaji', 'India', '2025-12-31 23:59:59', 15.5732, 73.7443),

-- Kerala - Kochi Missions
('Fort Kochi Walking Tour', 'Explore colonial history walking through Fort Kochi streets and landmarks', 'cultural', 'Easy', 100, 'Kochi', 'India', '2025-12-31 23:59:59', 9.9648, 76.2415),
('Chinese Fishing Nets Experience', 'Learn to operate traditional Chinese fishing nets with local fishermen', 'cultural', 'Medium', 130, 'Kochi', 'India', '2025-12-31 23:59:59', 9.9648, 76.2415),
('Spice Market Discovery', 'Visit spice markets and learn about Kerala spices and their uses', 'shopping', 'Easy', 90, 'Kochi', 'India', '2025-12-31 23:59:59', 9.9575, 76.2615),
('Kathakali Performance Night', 'Attend a traditional Kathakali dance performance and learn about the art form', 'cultural', 'Easy', 110, 'Kochi', 'India', '2025-12-31 23:59:59', 9.9312, 76.2673),
('Backwater Village Visit', 'Take a canoe through narrow canals to visit traditional fishing villages', 'nature', 'Medium', 140, 'Kochi', 'India', '2025-12-31 23:59:59', 9.9312, 76.2673),

-- Kerala - Alleppey Missions
('Houseboat Backwater Cruise', 'Spend a night on a traditional Kerala houseboat in the backwaters', 'nature', 'Easy', 180, 'Alleppey', 'India', '2025-12-31 23:59:59', 9.4981, 76.3388),
('Coir Factory Visit', 'Visit a coconut coir factory and learn about traditional Kerala industry', 'educational', 'Easy', 80, 'Alleppey', 'India', '2025-12-31 23:59:59', 9.4981, 76.3388),
('Kerala Cooking Class', 'Learn to cook traditional Kerala dishes using coconut and spices', 'food', 'Medium', 150, 'Alleppey', 'India', '2025-12-31 23:59:59', 9.4981, 76.3388),
('Snake Boat Race Experience', 'Witness or participate in traditional Kerala snake boat racing', 'cultural', 'Medium', 160, 'Alleppey', 'India', '2025-12-31 23:59:59', 9.4747, 76.3264),
('Ayurvedic Spa Treatment', 'Experience traditional Ayurvedic massage and treatments', 'wellness', 'Easy', 120, 'Alleppey', 'India', '2025-12-31 23:59:59', 9.4981, 76.3388),

-- Rajasthan - Udaipur Missions
('City of Lakes Boat Tour', 'Take boat rides on Lake Pichola and Fateh Sagar Lake', 'nature', 'Easy', 120, 'Udaipur', 'India', '2025-12-31 23:59:59', 24.5761, 73.6834),
('Palace Hopping in Udaipur', 'Visit City Palace, Jag Mandir, and Lake Palace in one day', 'historical', 'Medium', 170, 'Udaipur', 'India', '2025-12-31 23:59:59', 24.5761, 73.6834),
('Rajasthani Folk Performance', 'Attend a traditional folk dance and music performance', 'cultural', 'Easy', 100, 'Udaipur', 'India', '2025-12-31 23:59:59', 24.5761, 73.6834),
('Udaipur Vintage Car Museum', 'Explore the collection of vintage and classic cars of the Maharajas', 'historical', 'Easy', 90, 'Udaipur', 'India', '2025-12-31 23:59:59', 24.5678, 73.6908),
('Sunset Point Adventure', 'Visit Sajjangarh Palace for panoramic sunset views over Udaipur', 'nature', 'Easy', 80, 'Udaipur', 'India', '2025-12-31 23:59:59', 24.5441, 73.6644),

-- Rajasthan - Jodhpur Missions
('Blue City Photography Walk', 'Capture the blue houses of old Jodhpur city with perfect shots', 'photography', 'Medium', 130, 'Jodhpur', 'India', '2025-12-31 23:59:59', 26.2893, 73.0240),
('Mehrangarh Fort Adventure', 'Explore the massive fort complex and try the zip line experience', 'adventure', 'Medium', 160, 'Jodhpur', 'India', '2025-12-31 23:59:59', 26.2971, 73.0187),
('Rajasthani Handicraft Quest', 'Shop for traditional textiles, handicrafts, and artifacts in Jodhpur markets', 'shopping', 'Easy', 90, 'Jodhpur', 'India', '2025-12-31 23:59:59', 26.2893, 73.0240),
('Desert Safari Experience', 'Take a camel safari to nearby desert areas and watch sunset', 'adventure', 'Medium', 180, 'Jodhpur', 'India', '2025-12-31 23:59:59', 26.2389, 73.0243),
('Heritage Hotel Experience', 'Dine at a heritage hotel and experience royal hospitality', 'cultural', 'Easy', 110, 'Jodhpur', 'India', '2025-12-31 23:59:59', 26.2971, 73.0187),

-- Karnataka - Bangalore Missions
('Garden City Exploration', 'Visit 3 gardens: Lalbagh, Cubbon Park, and Botanical Garden', 'nature', 'Easy', 110, 'Bangalore', 'India', '2025-12-31 23:59:59', 12.9507, 77.5848),
('Tech City Tour', 'Visit IT parks and learn about Bangalores role in Indias tech revolution', 'educational', 'Medium', 120, 'Bangalore', 'India', '2025-12-31 23:59:59', 12.9716, 77.5946),
('South Indian Food Trail', 'Try authentic South Indian dishes: dosa, idli, vada, uttapam, and filter coffee', 'food', 'Easy', 100, 'Bangalore', 'India', '2025-12-31 23:59:59', 12.9716, 77.5946),
('Bangalore Palace Visit', 'Explore the Tudor-style architecture and royal artifacts', 'historical', 'Easy', 90, 'Bangalore', 'India', '2025-12-31 23:59:59', 12.9982, 77.5915),
('Microbrewery Hop', 'Visit 3 different microbreweries and try craft beers (21+ only)', 'entertainment', 'Easy', 80, 'Bangalore', 'India', '2025-12-31 23:59:59', 12.9716, 77.5946),

-- Tamil Nadu - Chennai Missions
('Marina Beach Morning Walk', 'Take an early morning walk along the 13km Marina Beach', 'nature', 'Easy', 80, 'Chennai', 'India', '2025-12-31 23:59:59', 13.0487, 80.2825),
('Temple Architecture Trail', 'Visit 3 ancient temples to study Dravidian architecture', 'religious', 'Medium', 140, 'Chennai', 'India', '2025-12-31 23:59:59', 13.0338, 80.2691),
('Filter Coffee Culture', 'Experience authentic South Indian filter coffee culture at 5 different places', 'food', 'Easy', 90, 'Chennai', 'India', '2025-12-31 23:59:59', 13.0827, 80.2707),
('Classical Music Concert', 'Attend a Carnatic classical music concert during music season', 'cultural', 'Easy', 110, 'Chennai', 'India', '2025-12-31 23:59:59', 13.0827, 80.2707),
('Government Museum Exploration', 'Explore the second oldest museum in India with diverse collections', 'educational', 'Medium', 100, 'Chennai', 'India', '2025-12-31 23:59:59', 13.0732, 80.2609),

-- West Bengal - Kolkata Missions
('Colonial Architecture Walk', 'Explore British colonial buildings in central Kolkata', 'historical', 'Medium', 120, 'Kolkata', 'India', '2025-12-31 23:59:59', 22.5726, 88.3639),
('Bengali Sweet Trail', 'Try 5 traditional Bengali sweets: rasgulla, sandesh, mishti doi, chomchom, and kalojam', 'food', 'Easy', 110, 'Kolkata', 'India', '2025-12-31 23:59:59', 22.5726, 88.3639),
('Howrah Bridge Crossing', 'Walk or take transport across the iconic Howrah Bridge', 'cultural', 'Easy', 70, 'Kolkata', 'India', '2025-12-31 23:59:59', 22.5958, 88.3468),
('Durga Puja Experience', 'Visit pandals during Durga Puja festival (seasonal mission)', 'cultural', 'Easy', 150, 'Kolkata', 'India', '2025-12-31 23:59:59', 22.5726, 88.3639),
('Book Street Exploration', 'Browse books and literary culture at College Street', 'cultural', 'Easy', 80, 'Kolkata', 'India', '2025-12-31 23:59:59', 22.5726, 88.3639),

-- Himachal Pradesh - Shimla Missions
('Toy Train Journey', 'Take the UNESCO World Heritage Kalka-Shimla railway journey', 'transportation', 'Easy', 140, 'Shimla', 'India', '2025-12-31 23:59:59', 31.1048, 77.1734),
('Mall Road Shopping', 'Shop for woolen clothes and souvenirs on the famous Mall Road', 'shopping', 'Easy', 80, 'Shimla', 'India', '2025-12-31 23:59:59', 31.1048, 77.1734),
('Jakhu Temple Trek', 'Trek up to Jakhu Temple and see the giant Hanuman statue', 'adventure', 'Medium', 120, 'Shimla', 'India', '2025-12-31 23:59:59', 31.1079, 77.1718),
('British Heritage Trail', 'Visit Viceregal Lodge and other British-era buildings', 'historical', 'Medium', 110, 'Shimla', 'India', '2025-12-31 23:59:59', 31.1048, 77.1734),
('Apple Orchard Visit', 'Visit apple orchards and learn about Himachal fruit farming', 'educational', 'Easy', 90, 'Shimla', 'India', '2025-12-31 23:59:59', 31.1048, 77.1734),

-- Himachal Pradesh - Manali Missions
('Adventure Sports Challenge', 'Try 3 adventure activities: river rafting, paragliding, and trekking', 'adventure', 'Hard', 220, 'Manali', 'India', '2025-12-31 23:59:59', 32.2432, 77.1892),
('Rohtang Pass Expedition', 'Visit Rohtang Pass for snow activities and mountain views', 'nature', 'Medium', 160, 'Manali', 'India', '2025-12-31 23:59:59', 32.2500, 77.2500),
('Tibetan Culture Experience', 'Visit Tibetan monasteries and learn about local Tibetan culture', 'cultural', 'Medium', 130, 'Manali', 'India', '2025-12-31 23:59:59', 32.2432, 77.1892),
('Hot Springs Relaxation', 'Visit Vashisht hot springs for natural thermal bath experience', 'wellness', 'Easy', 100, 'Manali', 'India', '2025-12-31 23:59:59', 32.2315, 77.1642),
('Old Manali Exploration', 'Explore cafes, shops, and hippie culture in Old Manali', 'cultural', 'Easy', 90, 'Manali', 'India', '2025-12-31 23:59:59', 32.2396, 77.1887),

-- Uttarakhand - Rishikesh Missions
('Yoga Capital Experience', 'Attend yoga classes at 3 different ashrams', 'wellness', 'Medium', 150, 'Rishikesh', 'India', '2025-12-31 23:59:59', 30.0869, 78.2676),
('Ganges Aarti Ceremony', 'Attend the evening Ganga Aarti ceremony at Triveni Ghat', 'religious', 'Easy', 100, 'Rishikesh', 'India', '2025-12-31 23:59:59', 30.0869, 78.2676),
('River Rafting Adventure', 'Experience white water rafting on the Ganges river', 'adventure', 'Medium', 180, 'Rishikesh', 'India', '2025-12-31 23:59:59', 30.0869, 78.2676),
('Beatles Ashram Visit', 'Explore the abandoned ashram where the Beatles stayed in 1968', 'cultural', 'Easy', 90, 'Rishikesh', 'India', '2025-12-31 23:59:59', 30.1434, 78.3097),
('Bridge Hopping Challenge', 'Cross all famous bridges: Laxman Jhula, Ram Jhula, and Janki Setu', 'cultural', 'Easy', 80, 'Rishikesh', 'India', '2025-12-31 23:59:59', 30.1265, 78.3294),

-- Gujarat - Ahmedabad Missions
('Gandhi Heritage Trail', 'Visit Sabarmati Ashram and learn about Gandhis life and philosophy', 'historical', 'Medium', 130, 'Ahmedabad', 'India', '2025-12-31 23:59:59', 23.0615, 72.5809),
('Stepwell Architecture Hunt', 'Visit 3 stepwells: Adalaj, Dada Harir, and Mata Bhavani stepwells', 'historical', 'Medium', 140, 'Ahmedabad', 'India', '2025-12-31 23:59:59', 23.1613, 72.5821),
('Gujarati Thali Experience', 'Try an authentic unlimited Gujarati thali meal', 'food', 'Easy', 100, 'Ahmedabad', 'India', '2025-12-31 23:59:59', 23.0225, 72.5714),
('Textile Heritage Discovery', 'Visit Calico Museum and learn about Indias textile traditions', 'cultural', 'Medium', 110, 'Ahmedabad', 'India', '2025-12-31 23:59:59', 23.0225, 72.5714),
('Street Food Night Walk', 'Try street food in different areas: Law Garden, Manek Chowk, and Khau Galli', 'food', 'Easy', 90, 'Ahmedabad', 'India', '2025-12-31 23:59:59', 23.0225, 72.5714);