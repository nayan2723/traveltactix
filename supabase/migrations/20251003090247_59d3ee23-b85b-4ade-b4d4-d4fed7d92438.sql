-- Add missions for various Indian states
INSERT INTO missions (title, description, category, difficulty, xp_reward, city, country, latitude, longitude) VALUES
-- North India
('Delhi Heritage Walk', 'Visit 5 UNESCO World Heritage Sites in Old Delhi including Red Fort, Qutub Minar, and Humayun''s Tomb', 'Cultural', 'Medium', 200, 'Delhi', 'India', 28.7041, 77.1025),
('Golden Temple Service', 'Participate in seva (community service) at Golden Temple and taste langar', 'Spiritual', 'Easy', 150, 'Amritsar', 'India', 31.6200, 74.8765),
('Jaipur Royal Experience', 'Explore three palaces: Hawa Mahal, City Palace, and Amber Fort', 'Cultural', 'Medium', 200, 'Jaipur', 'India', 26.9124, 75.7873),

-- South India
('Madurai Temple Trail', 'Visit Meenakshi Temple at different times to experience various rituals', 'Spiritual', 'Easy', 150, 'Madurai', 'India', 9.9195, 78.1193),
('Kerala Backwater Journey', 'Complete a houseboat stay and try 5 Kerala dishes', 'Cultural', 'Easy', 150, 'Alleppey', 'India', 9.4981, 76.3388),
('Hampi Boulder Climbing', 'Climb at least 3 bouldering routes and visit 5 ruins', 'Adventure', 'Hard', 300, 'Hampi', 'India', 15.3350, 76.4600),

-- East India
('Kolkata Cultural Immersion', 'Attend a Rabindra Sangeet concert and visit Durga Puja pandals', 'Cultural', 'Medium', 200, 'Kolkata', 'India', 22.5726, 88.3639),
('Darjeeling Tea Trail', 'Visit 3 tea estates and ride the Toy Train', 'Cultural', 'Easy', 150, 'Darjeeling', 'India', 27.0410, 88.2663),
('Kaziranga Safari Quest', 'Spot one-horned rhinos, elephants, and take 2 safaris', 'Adventure', 'Medium', 200, 'Kaziranga', 'India', 26.5775, 93.1711),

-- West India
('Mumbai Food Trail', 'Try 10 different street food items across Mumbai', 'Foodie', 'Easy', 150, 'Mumbai', 'India', 19.0760, 72.8777),
('Rann Utsav Experience', 'Attend cultural performances and watch full moon over white desert', 'Cultural', 'Medium', 200, 'Kutch', 'India', 23.7337, 69.8597),
('Goa Heritage Quest', 'Visit 5 Portuguese churches in Old Goa', 'Cultural', 'Easy', 150, 'Goa', 'India', 15.5007, 73.9117),

-- Northeast India
('Meghalaya Living Bridges', 'Trek to and cross the Double Decker Living Root Bridge', 'Adventure', 'Hard', 300, 'Cherrapunji', 'India', 25.2631, 91.7324),
('Hornbill Festival', 'Attend Hornbill Festival and interact with 3 different Naga tribes', 'Cultural', 'Medium', 200, 'Kohima', 'India', 25.6701, 94.1077),
('Tawang Monastery Journey', 'Visit Tawang Monastery and attend morning prayers', 'Spiritual', 'Medium', 200, 'Tawang', 'India', 27.5860, 91.8590),

-- Central India
('Khajuraho Temple Explorer', 'Visit Western and Eastern temple groups, attend light show', 'Cultural', 'Medium', 200, 'Khajuraho', 'India', 24.8318, 79.9199),
('Varanasi Spiritual Journey', 'Witness Ganga Aarti, take boat ride at sunrise, visit Sarnath', 'Spiritual', 'Easy', 150, 'Varanasi', 'India', 25.3176, 82.9739),

-- Himalayas
('Rishikesh Adventure', 'Complete white water rafting and attend evening Ganga Aarti', 'Adventure', 'Medium', 200, 'Rishikesh', 'India', 30.0869, 78.2676),
('Valley of Flowers Trek', 'Complete the trek and photograph 20 different alpine flowers', 'Adventure', 'Hard', 300, 'Chamoli', 'India', 30.7268, 79.6033),
('Spiti Valley Circuit', 'Visit 5 monasteries in Spiti Valley within a week', 'Adventure', 'Hard', 300, 'Spiti', 'India', 32.2466, 78.0334);

-- Add AR hotspots for famous Indian monuments
INSERT INTO ar_hotspots (landmark_name, city, country, latitude, longitude, cultural_facts, image_url) VALUES
-- UNESCO World Heritage Sites
('Taj Mahal', 'Agra', 'India', 27.1751, 78.0421, '[
  {"fact": "Built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal", "category": "history"},
  {"fact": "The monument changes color throughout the day from pinkish in morning to golden at sunset", "category": "architecture"},
  {"fact": "It took 22 years and 20,000 workers to complete", "category": "history"},
  {"fact": "The four minarets are designed to fall away from the tomb in case of earthquake", "category": "architecture"}
]', 'https://images.unsplash.com/photo-1564507592333-c60657eea523'),

('Qutub Minar', 'Delhi', 'India', 28.5244, 77.1855, '[
  {"fact": "Tallest brick minaret in the world at 72.5 meters", "category": "architecture"},
  {"fact": "Construction started in 1192 by Qutb ud-Din Aibak", "category": "history"},
  {"fact": "Has 379 stairs to reach the top", "category": "architecture"},
  {"fact": "Built with red sandstone and marble", "category": "architecture"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc'),

('Red Fort', 'Delhi', 'India', 28.6562, 77.2410, '[
  {"fact": "Main residence of Mughal Emperors for 200 years", "category": "history"},
  {"fact": "Prime Minister hoists national flag here on Independence Day", "category": "tradition"},
  {"fact": "Original name was Qila-e-Mubarak (Blessed Fort)", "category": "history"},
  {"fact": "Built with red sandstone, hence the name", "category": "architecture"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc'),

('Gateway of India', 'Mumbai', 'India', 18.9220, 72.8347, '[
  {"fact": "Built to commemorate visit of King George V and Queen Mary", "category": "history"},
  {"fact": "Completed in 1924, took 13 years to build", "category": "history"},
  {"fact": "Last British troops left India through this gateway in 1948", "category": "history"},
  {"fact": "Built in Indo-Saracenic architectural style", "category": "architecture"}
]', 'https://images.unsplash.com/photo-1566552881560-0be862a7c445'),

('Charminar', 'Hyderabad', 'India', 17.3616, 78.4747, '[
  {"fact": "Built in 1591 by Muhammad Quli Qutb Shah", "category": "history"},
  {"fact": "Each of its four minarets stands 56 meters tall", "category": "architecture"},
  {"fact": "Has 149 steps to reach the top", "category": "architecture"},
  {"fact": "Built to commemorate end of a deadly plague", "category": "history"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc'),

('Hawa Mahal', 'Jaipur', 'India', 26.9239, 75.8267, '[
  {"fact": "Palace of Winds has 953 small windows called jharokhas", "category": "architecture"},
  {"fact": "Built for royal ladies to observe street festivals without being seen", "category": "history"},
  {"fact": "Made of red and pink sandstone", "category": "architecture"},
  {"fact": "Five-story building is only one room wide", "category": "architecture"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc'),

('Golden Temple', 'Amritsar', 'India', 31.6200, 74.8765, '[
  {"fact": "The dome is covered with 750 kg of pure gold", "category": "architecture"},
  {"fact": "The temple kitchen serves free meals to over 100,000 people daily", "category": "tradition"},
  {"fact": "Open to people of all religions and backgrounds", "category": "tradition"},
  {"fact": "The temple was built in the 16th century", "category": "history"}
]', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220'),

('Meenakshi Temple', 'Madurai', 'India', 9.9195, 78.1193, '[
  {"fact": "Temple has 14 gopurams (gateway towers) with thousands of colorful sculptures", "category": "architecture"},
  {"fact": "Dedicated to Goddess Meenakshi and Lord Sundareswarar", "category": "tradition"},
  {"fact": "Receives 15,000 visitors daily, 25,000 on Fridays", "category": "tradition"},
  {"fact": "The temple complex covers 14 acres", "category": "architecture"}
]', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220'),

('Konark Sun Temple', 'Puri', 'India', 19.8876, 86.0945, '[
  {"fact": "Built in the shape of a giant chariot with 24 wheels", "category": "architecture"},
  {"fact": "The wheels are sundials that accurately tell time", "category": "science"},
  {"fact": "Built in 13th century by King Narasimhadeva I", "category": "history"},
  {"fact": "Made of Khondalite rocks", "category": "architecture"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc'),

('Mysore Palace', 'Mysore', 'India', 12.3051, 76.6551, '[
  {"fact": "Illuminated with 100,000 light bulbs on Sundays and festivals", "category": "tradition"},
  {"fact": "The palace is a three-story stone structure", "category": "architecture"},
  {"fact": "Houses the golden throne (Ratna Simasana)", "category": "history"},
  {"fact": "Receives over 6 million visitors annually", "category": "tradition"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc'),

('Victoria Memorial', 'Kolkata', 'India', 22.5448, 88.3426, '[
  {"fact": "Built in memory of Queen Victoria using white Makrana marble", "category": "history"},
  {"fact": "Combines British and Mughal architecture", "category": "architecture"},
  {"fact": "Surrounded by 64 acres of gardens", "category": "architecture"},
  {"fact": "Now serves as a museum with 28,394 artifacts", "category": "history"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc'),

('Mahabodhi Temple', 'Bodh Gaya', 'India', 24.6956, 84.9914, '[
  {"fact": "Marks the spot where Buddha attained enlightenment", "category": "tradition"},
  {"fact": "The Bodhi tree here is descendant of the original tree", "category": "history"},
  {"fact": "Built in 5th-6th century CE", "category": "history"},
  {"fact": "One of the oldest brick temples still standing in India", "category": "architecture"}
]', 'https://images.unsplash.com/photo-1548013146-72479768bada'),

('Ajanta Caves', 'Aurangabad', 'India', 20.5520, 75.7033, '[
  {"fact": "30 rock-cut Buddhist cave monuments dating from 2nd century BCE", "category": "history"},
  {"fact": "Famous for paintings that are masterpieces of Buddhist art", "category": "architecture"},
  {"fact": "Caves were abandoned and forgotten until discovered in 1819", "category": "history"},
  {"fact": "Took over 800 years to complete", "category": "history"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc'),

('Khajuraho Temples', 'Khajuraho', 'India', 24.8318, 79.9199, '[
  {"fact": "Famous for erotic sculptures representing medieval Hindu culture", "category": "architecture"},
  {"fact": "Only 25 of original 85 temples survive today", "category": "history"},
  {"fact": "Built by Chandela dynasty between 950-1050 CE", "category": "history"},
  {"fact": "Sculptures depict various aspects of life - spiritual, erotic, and worldly", "category": "tradition"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc'),

('Jaisalmer Fort', 'Jaisalmer', 'India', 26.9124, 70.9167, '[
  {"fact": "One of the few living forts in the world with people still residing inside", "category": "tradition"},
  {"fact": "Built in 1156 CE by Rajput ruler Jaisal", "category": "history"},
  {"fact": "Made of yellow sandstone, appears golden in sunlight", "category": "architecture"},
  {"fact": "Houses 4 massive gateways and 99 bastions", "category": "architecture"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc'),

('Amber Fort', 'Jaipur', 'India', 26.9855, 75.8513, '[
  {"fact": "Built with red sandstone and marble", "category": "architecture"},
  {"fact": "The Sheesh Mahal (Mirror Palace) has walls covered with mirrors", "category": "architecture"},
  {"fact": "Elephant rides available to reach the fort entrance", "category": "tradition"},
  {"fact": "Built in 1592 by Raja Man Singh I", "category": "history"}
]', 'https://images.unsplash.com/photo-1604780857-0b88c9b48dcc')