-- Insert diverse Indian places (hidden gems and popular spots)
INSERT INTO public.places (name, description, category, city, country, latitude, longitude, mood_tags, is_hidden_gem, cultural_tips, image_urls, estimated_visit_time) VALUES

-- Rajasthan
('Chand Baori Stepwell', 'Ancient stepwell with 3,500 perfectly symmetrical steps dating back to 9th century. One of the deepest stepwells in India with stunning geometric architecture.', 'Historical', 'Abhaneri', 'India', 27.0074, 76.6077, ARRAY['Adventure', 'Photography', 'Historical'], true, '{"best_time": "Early morning for best light", "tip": "Wear comfortable shoes for stairs", "cultural_note": "Built to conserve water in arid region"}', ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24'], 90),

('Bundi Palace', 'Lesser-known fortress with incredible frescoes, overlooking the blue city of Bundi. Features intricate murals and stunning architecture.', 'Historical', 'Bundi', 'India', 25.4305, 75.6499, ARRAY['Historical', 'Photography', 'Offbeat'], true, '{"best_time": "October to March", "tip": "Hire local guide for history", "cultural_note": "Former capital of princely state"}', ARRAY['https://images.unsplash.com/photo-1599661046289-e31897846e41'], 120),

('Kumbhalgarh Fort', 'Majestic hilltop fort with the second longest wall in the world after the Great Wall of China. Offers panoramic Aravalli views.', 'Historical', 'Kumbhalgarh', 'India', 25.1522, 73.5857, ARRAY['Adventure', 'Historical', 'Scenic'], true, '{"best_time": "Sunset for golden hour", "tip": "Wall walk takes 2-3 hours", "cultural_note": "Birthplace of Maharana Pratap"}', ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24'], 180),

-- Meghalaya
('Living Root Bridges', 'Bio-engineered bridges made from rubber tree roots by Khasi tribe. Takes 15-20 years to grow. Double-decker bridge is most famous.', 'Nature', 'Cherrapunji', 'India', 25.2615, 91.7309, ARRAY['Adventure', 'Nature', 'Unique'], true, '{"best_time": "October to May", "tip": "Trek requires good fitness", "cultural_note": "Indigenous Khasi engineering marvel"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 240),

('Mawlynnong Village', 'Asia cleanest village with living root bridges nearby. Known for cleanliness, bamboo houses, and sky-view platforms.', 'Village', 'Mawlynnong', 'India', 25.1833, 91.9500, ARRAY['Nature', 'Cultural', 'Peaceful'], true, '{"best_time": "Post-monsoon for lush greenery", "tip": "Stay in bamboo homestays", "cultural_note": "Community-driven cleanliness initiative"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 120),

('Dawki River', 'Crystal clear river where boats appear to float in air. Part of India-Bangladesh border. Perfect for boating and photography.', 'Nature', 'Dawki', 'India', 25.1833, 92.0167, ARRAY['Photography', 'Scenic', 'Adventure'], true, '{"best_time": "November to May for clear water", "tip": "Book boat rides early morning", "cultural_note": "Border trade happens on river"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 90),

-- Kerala
('Varkala Cliff Beach', 'Unique cliff-backed beach with natural springs believed to have medicinal properties. Less crowded than Kovalam.', 'Beach', 'Varkala', 'India', 8.7379, 76.7163, ARRAY['Relax', 'Scenic', 'Spiritual'], false, '{"best_time": "November to March", "tip": "Try cliff-top cafes for sunset", "cultural_note": "Holy beach for Hindu rituals"}', ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944'], 180),

('Munroe Island', 'Serene backwater island with narrow canals, village life, and traditional coir-making. Perfect for kayaking.', 'Nature', 'Kollam', 'India', 8.9806, 76.6667, ARRAY['Peaceful', 'Nature', 'Cultural'], true, '{"best_time": "October to February", "tip": "Take canoe through narrow canals", "cultural_note": "Watch coir and prawn farming"}', ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944'], 150),

('Athirapally Falls', 'Largest waterfall in Kerala, often called Niagara of India. Surrounded by lush Sholayar forest.', 'Waterfall', 'Thrissur', 'India', 10.2852, 76.5703, ARRAY['Nature', 'Photography', 'Adventure'], false, '{"best_time": "Monsoon for full flow", "tip": "Trek to bottom for best views", "cultural_note": "Featured in Bollywood films"}', ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944'], 120),

-- Karnataka
('Gokarna Beaches', 'Pristine beaches away from commercialization. Om Beach shaped like Om symbol. Perfect for laid-back beach life.', 'Beach', 'Gokarna', 'India', 14.5479, 74.3188, ARRAY['Relax', 'Beach', 'Peaceful'], true, '{"best_time": "October to March", "tip": "Beach hop via trekking trail", "cultural_note": "Sacred pilgrimage town"}', ARRAY['https://images.unsplash.com/photo-1596422846543-75c6fc197f07'], 240),

('Hampi Ruins', 'UNESCO World Heritage site with ancient temple ruins scattered across boulder-strewn landscape. Former Vijayanagara Empire capital.', 'Historical', 'Hampi', 'India', 15.3350, 76.4600, ARRAY['Historical', 'Photography', 'Adventure'], false, '{"best_time": "November to February", "tip": "Rent scooter to explore", "cultural_note": "14th century ruins and temples"}', ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24'], 360),

('Jog Falls', 'India second-highest plunge waterfall cascading 830 feet. Four distinct cascades create spectacular sight.', 'Waterfall', 'Shimoga', 'India', 14.2295, 74.8133, ARRAY['Nature', 'Photography', 'Scenic'], false, '{"best_time": "Monsoon for maximum water flow", "tip": "Trek to base during dry season", "cultural_note": "Featured on Indian currency"}', ARRAY['https://images.unsplash.com/photo-1596422846543-75c6fc197f07'], 90),

-- Himachal Pradesh
('Tirthan Valley', 'Offbeat Himalayan valley with trout fishing, pristine river, and Great Himalayan National Park access. Ideal for peaceful retreat.', 'Mountain', 'Kullu', 'India', 31.6167, 77.4000, ARRAY['Nature', 'Adventure', 'Peaceful'], true, '{"best_time": "March to June and September to November", "tip": "Stay in riverside homestays", "cultural_note": "Base for GHNP treks"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 240),

('Spiti Valley', 'High-altitude cold desert with ancient monasteries, barren mountains, and Tibetan culture. One of India most remote regions.', 'Mountain', 'Spiti', 'India', 32.2463, 78.0413, ARRAY['Adventure', 'Spiritual', 'Photography'], true, '{"best_time": "June to September only", "tip": "Acclimatize properly for altitude", "cultural_note": "Buddhist monasteries and culture"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 480),

('Chitkul Village', 'Last inhabited village near Indo-Tibet border. Scenic Baspa River valley surrounded by snow peaks.', 'Village', 'Kinnaur', 'India', 31.4167, 78.4167, ARRAY['Peaceful', 'Scenic', 'Offbeat'], true, '{"best_time": "May to October", "tip": "Permits required for foreigners", "cultural_note": "Kinnauri wood architecture"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 180),

-- Uttarakhand
('Valley of Flowers', 'UNESCO World Heritage alpine valley with 500 plus species of wildflowers. Stunning meadows at 3600m altitude.', 'Nature', 'Chamoli', 'India', 30.7268, 79.6008, ARRAY['Nature', 'Adventure', 'Photography'], false, '{"best_time": "July to September for blooms", "tip": "Requires 3-day trek", "cultural_note": "Sacred to locals, discovered 1931"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 360),

('Auli', 'Pristine skiing destination with panoramic Himalayan views. Cable car offers spectacular vistas.', 'Mountain', 'Chamoli', 'India', 30.5200, 79.5542, ARRAY['Adventure', 'Scenic', 'Winter'], true, '{"best_time": "December to March for skiing", "tip": "Book ski equipment in advance", "cultural_note": "Training ground for Indian army"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 240),

-- Tamil Nadu
('Chettinad Heritage', 'Region with magnificent mansions showcasing Chettiar architectural heritage. Known for spicy cuisine and antique furniture.', 'Cultural', 'Karaikudi', 'India', 10.0664, 78.7846, ARRAY['Cultural', 'Historical', 'Food'], true, '{"best_time": "October to March", "tip": "Stay in heritage mansion hotels", "cultural_note": "Unique blend of Tamil and European architecture"}', ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24'], 180),

('Dhanushkodi Ghost Town', 'Abandoned town at India southern tip destroyed by 1964 cyclone. Eerie ruins meet pristine beaches.', 'Historical', 'Rameswaram', 'India', 9.1667, 79.4333, ARRAY['Offbeat', 'Photography', 'Beach'], true, '{"best_time": "October to March", "tip": "Shared jeeps from Rameswaram", "cultural_note": "Where Bay of Bengal meets Indian Ocean"}', ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944'], 120),

-- Gujarat
('Rann of Kutch', 'World largest white salt desert stretching to horizon. Spectacular during full moon. Cultural festivals and handicrafts.', 'Desert', 'Kutch', 'India', 23.7337, 69.8597, ARRAY['Unique', 'Photography', 'Cultural'], false, '{"best_time": "November to February during Rann Utsav", "tip": "Stay in desert camp tents", "cultural_note": "Famous for embroidery and handicrafts"}', ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24'], 180),

('Champaner-Pavagadh', 'UNESCO World Heritage with 16th century Islamic architecture and hilltop Hindu temple. Blend of cultures.', 'Historical', 'Panchmahal', 'India', 22.4858, 73.5347, ARRAY['Historical', 'Spiritual', 'Adventure'], true, '{"best_time": "October to March", "tip": "Ropeway to hilltop temple", "cultural_note": "Pre-Mughal Islamic architecture"}', ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24'], 240),

-- Madhya Pradesh
('Orchha Fort Complex', 'Medieval town frozen in time with palaces, temples and cenotaphs. Betwa River views and sound and light show.', 'Historical', 'Orchha', 'India', 25.3520, 78.6390, ARRAY['Historical', 'Photography', 'Peaceful'], true, '{"best_time": "October to March", "tip": "Stay in heritage hotel", "cultural_note": "Bundela dynasty capital"}', ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24'], 180),

('Bhedaghat Marble Rocks', 'Stunning white marble canyon with 100ft cliffs along Narmada River. Moonlit boat rides are magical.', 'Nature', 'Jabalpur', 'India', 23.1275, 79.8158, ARRAY['Scenic', 'Photography', 'Romantic'], true, '{"best_time": "Full moon night boat rides", "tip": "Cable car for aerial views", "cultural_note": "Ancient marble quarries"}', ARRAY['https://images.unsplash.com/photo-1596422846543-75c6fc197f07'], 120),

-- Northeast India
('Ziro Valley', 'Picturesque valley with Apatani tribal culture, rice fields, and pine hills. UNESCO World Heritage site nominee.', 'Valley', 'Ziro', 'India', 27.5450, 93.8236, ARRAY['Cultural', 'Nature', 'Peaceful'], true, '{"best_time": "March to October", "tip": "Attend Ziro Music Festival", "cultural_note": "Apatani tribe with unique facial tattoos"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 240),

('Majuli Island', 'World largest river island in Brahmaputra. Neo-Vaishnavite monasteries, mask-making, and tribal culture.', 'Island', 'Majuli', 'India', 26.9504, 94.2153, ARRAY['Cultural', 'Spiritual', 'Unique'], true, '{"best_time": "November to April", "tip": "Visit satras or monasteries", "cultural_note": "Eroding island threatened by floods"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 180),

-- Andaman
('Havelock Island', 'Pristine beaches with turquoise waters. Radhanagar Beach ranked Asia best. Excellent diving and snorkeling.', 'Beach', 'Havelock', 'India', 12.0167, 93.0000, ARRAY['Beach', 'Adventure', 'Relax'], false, '{"best_time": "October to May", "tip": "Book dive trips in advance", "cultural_note": "Coral reefs and marine life"}', ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944'], 240),

('Neil Island', 'Smaller, quieter alternative to Havelock. Natural rock formations, coral reefs, and laid-back vibe.', 'Beach', 'Neil Island', 'India', 11.8333, 93.0333, ARRAY['Relax', 'Beach', 'Peaceful'], true, '{"best_time": "November to April", "tip": "Bicycle around island", "cultural_note": "Natural bridge and coral reefs"}', ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944'], 180),

-- Ladakh
('Pangong Lake', 'Stunning high-altitude lake changing colors throughout the day. Extends from India to Tibet. Bollywood filming location.', 'Lake', 'Leh', 'India', 33.7000, 78.9500, ARRAY['Scenic', 'Photography', 'Adventure'], false, '{"best_time": "May to September", "tip": "Overnight camping for sunrise", "cultural_note": "Featured in 3 Idiots movie"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 240),

('Nubra Valley', 'High-altitude cold desert with sand dunes, double-humped camels, and ancient monasteries. Reached via Khardung La pass.', 'Valley', 'Leh', 'India', 34.5500, 77.5667, ARRAY['Adventure', 'Unique', 'Photography'], true, '{"best_time": "June to September", "tip": "Stay in Hunder village", "cultural_note": "Bactrian camels and Diskit Monastery"}', ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'], 360),

-- Goa (lesser known)
('Cabo de Rama Fort', 'Ancient clifftop fort with stunning Arabian Sea views. Named after Lord Rama from Ramayana. Peaceful and less touristy.', 'Historical', 'Canacona', 'India', 15.0833, 73.9167, ARRAY['Historical', 'Scenic', 'Peaceful'], true, '{"best_time": "November to February", "tip": "Combine with Palolem Beach visit", "cultural_note": "Portuguese military fort"}', ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944'], 90),

('Divar Island', 'Quiet island with Portuguese heritage, colorful houses, and old churches. Ferry ride from Panjim. No vehicles.', 'Island', 'Divar', 'India', 15.5333, 73.9167, ARRAY['Peaceful', 'Cultural', 'Offbeat'], true, '{"best_time": "October to March", "tip": "Rent bicycle to explore", "cultural_note": "Indo-Portuguese architecture"}', ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944'], 120);