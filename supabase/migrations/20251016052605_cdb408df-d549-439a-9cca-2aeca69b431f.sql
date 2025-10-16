-- Continue inserting cultural lessons for remaining Indian states

INSERT INTO cultural_lessons (title, description, city, country, language, difficulty_level, cultural_xp, duration_minutes, lesson_data) VALUES

-- 9. Himachal Pradesh
('Himalayan Culture of Himachal', 'Experience the mountain culture and spirituality', 'Shimla', 'India', 'Hindi', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Himachal Pradesh, nestled in the Himalayas, has a rich culture influenced by Buddhist and Hindu traditions."},
  {"type": "culture", "title": "Cultural Heritage", "items": [
    "Buddhist monasteries in Dharamshala",
    "Kullu Dussehra - Week-long festival",
    "Traditional Himachali cap and attire",
    "Kinnauri shawls"
  ]},
  {"type": "cuisine", "title": "Himachali Food", "items": [
    "Dham - Festive meal",
    "Siddu - Steamed bread",
    "Madra - Chickpea curry",
    "Chha Gosht - Marinated lamb"
  ]},
  {"type": "quiz", "questions": [
    {"question": "Which festival is famous in Kullu?", "options": ["Diwali", "Holi", "Dussehra", "Pongal"], "correct": 2}
  ]}
]}'),

-- 10. Jharkhand
('Tribal Culture of Jharkhand', 'Discover the land of forests and tribal heritage', 'Ranchi', 'India', 'Hindi', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Jharkhand, the land of forests, is home to diverse tribal communities with rich cultural traditions."},
  {"type": "culture", "title": "Cultural Elements", "items": [
    "Sarhul Festival - Spring celebration",
    "Chhau dance - Martial folk dance",
    "Tribal arts and crafts",
    "Sun Temple at Ranchi"
  ]},
  {"type": "cuisine", "title": "Local Cuisine", "items": [
    "Dhuska - Rice pancake",
    "Litti Chokha",
    "Chilka Roti",
    "Rugra - Mushroom curry"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Chhau?", "options": ["A dish", "Martial folk dance", "A temple", "A language"], "correct": 1}
  ]}
]}'),

-- 11. Karnataka
('Kannada Culture and Heritage', 'Explore the rich traditions of Karnataka', 'Bengaluru', 'India', 'Kannada', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Karnataka, home to ancient kingdoms and modern IT hubs, has a glorious cultural heritage."},
  {"type": "language", "title": "Kannada Basics", "phrases": [
    {"kannada": "Namaskara", "english": "Hello", "pronunciation": "na-mas-ka-ra"},
    {"kannada": "Hegiddira", "english": "How are you?", "pronunciation": "he-gid-di-ra"},
    {"kannada": "Dhanyavadagalu", "english": "Thank you", "pronunciation": "dhan-ya-va-da-ga-lu"}
  ]},
  {"type": "culture", "title": "Cultural Highlights", "items": [
    "Mysore Dasara - Royal celebration",
    "Yakshagana - Traditional theater",
    "Hampi - UNESCO World Heritage Site",
    "Carnatic music tradition"
  ]},
  {"type": "cuisine", "title": "Karnataka Cuisine", "items": [
    "Masala Dosa",
    "Bisi Bele Bath",
    "Mysore Pak",
    "Ragi Mudde"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Yakshagana?", "options": ["A dance", "Traditional theater", "A temple", "A dish"], "correct": 1},
    {"question": "Which UNESCO site is in Karnataka?", "options": ["Ajanta Caves", "Hampi", "Konark Temple", "Mahabalipuram"], "correct": 1}
  ]}
]}'),

-- 12. Kerala
('Kerala - Gods Own Country', 'Experience the unique Malayali culture', 'Thiruvananthapuram', 'India', 'Malayalam', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Kerala, Gods Own Country, is known for its backwaters, Ayurveda, and rich cultural traditions."},
  {"type": "language", "title": "Malayalam Basics", "phrases": [
    {"malayalam": "Namaskaram", "english": "Hello", "pronunciation": "na-mas-ka-ram"},
    {"malayalam": "Sukhamaano", "english": "How are you?", "pronunciation": "su-kha-maa-no"},
    {"malayalam": "Nanni", "english": "Thank you", "pronunciation": "nan-ni"}
  ]},
  {"type": "culture", "title": "Cultural Heritage", "items": [
    "Kathakali - Classical dance drama",
    "Onam - Harvest festival",
    "Snake boat races",
    "Ayurveda tradition"
  ]},
  {"type": "cuisine", "title": "Kerala Cuisine", "items": [
    "Sadya - Festive meal on banana leaf",
    "Appam with Stew",
    "Karimeen Pollichathu - Fish preparation",
    "Payasam - Sweet dessert"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Kathakali?", "options": ["A dance drama", "A boat", "A temple", "A dish"], "correct": 0},
    {"question": "Which is the harvest festival of Kerala?", "options": ["Pongal", "Onam", "Bihu", "Baisakhi"], "correct": 1}
  ]}
]}'),

-- 13. Madhya Pradesh
('Heart of India - Madhya Pradesh', 'Explore the cultural center of India', 'Bhopal', 'India', 'Hindi', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Madhya Pradesh, the Heart of India, is rich in history, temples, and tribal culture."},
  {"type": "culture", "title": "Cultural Treasures", "items": [
    "Khajuraho Temples - UNESCO World Heritage Site",
    "Gond and Bhil tribal art",
    "Bundeli and Malwi folk dances",
    "Sanchi Stupa - Buddhist monument"
  ]},
  {"type": "cuisine", "title": "MP Cuisine", "items": [
    "Poha-Jalebi",
    "Dal Bafla",
    "Bhutte ka Kees",
    "Mawa-Bati"
  ]},
  {"type": "quiz", "questions": [
    {"question": "Which UNESCO site has erotic sculptures?", "options": ["Ajanta", "Khajuraho", "Sanchi", "Ellora"], "correct": 1}
  ]}
]}'),

-- 14. Maharashtra
('Marathi Culture and Mumbai Spirit', 'Experience the dynamic culture of Maharashtra', 'Mumbai', 'India', 'Marathi', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Maharashtra, home to Maratha warriors and Bollywood, has a vibrant and diverse culture."},
  {"type": "language", "title": "Marathi Basics", "phrases": [
    {"marathi": "Namaskar", "english": "Hello", "pronunciation": "na-mas-kar"},
    {"marathi": "Kasa kay", "english": "How are you?", "pronunciation": "ka-sa kay"},
    {"marathi": "Dhanyavaad", "english": "Thank you", "pronunciation": "dhan-ya-vaad"}
  ]},
  {"type": "culture", "title": "Cultural Heritage", "items": [
    "Ganesh Chaturthi - Major festival",
    "Lavani - Traditional dance",
    "Ajanta and Ellora Caves - UNESCO sites",
    "Warli tribal art"
  ]},
  {"type": "cuisine", "title": "Maharashtrian Food", "items": [
    "Vada Pav",
    "Puran Poli",
    "Misal Pav",
    "Modak - Ganeshas favorite"
  ]},
  {"type": "quiz", "questions": [
    {"question": "Which is the major festival of Maharashtra?", "options": ["Diwali", "Ganesh Chaturthi", "Holi", "Navratri"], "correct": 1},
    {"question": "What is Lavani?", "options": ["A dance", "A dish", "A temple", "A language"], "correct": 0}
  ]}
]}'),

-- 15. Manipur
('Jewel of India - Manipur', 'Discover the cultural richness of Manipur', 'Imphal', 'India', 'Meitei', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Manipur, the Jewel of India, is known for its natural beauty and rich dance traditions."},
  {"type": "culture", "title": "Cultural Heritage", "items": [
    "Manipuri - Classical dance form",
    "Lai Haraoba - Festival",
    "Polo originated here",
    "Sangai Festival - Annual tourism festival"
  ]},
  {"type": "cuisine", "title": "Manipuri Cuisine", "items": [
    "Eromba - Boiled vegetables with chili",
    "Singju - Salad",
    "Chamthong - Vegetable stew",
    "Nga Thongba - Fish curry"
  ]},
  {"type": "quiz", "questions": [
    {"question": "Which sport originated in Manipur?", "options": ["Hockey", "Polo", "Cricket", "Kabaddi"], "correct": 1}
  ]}
]}'),

-- 16. Meghalaya
('Abode of Clouds - Meghalaya', 'Experience the living root bridges and culture', 'Shillong', 'India', 'Khasi', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Meghalaya, the Abode of Clouds, is famous for its living root bridges and matrilineal society."},
  {"type": "culture", "title": "Cultural Elements", "items": [
    "Living root bridges",
    "Matrilineal society of Khasi tribe",
    "Wangala Festival - Garo harvest festival",
    "Shad Suk Mynsiem - Traditional dance"
  ]},
  {"type": "cuisine", "title": "Meghalayan Food", "items": [
    "Jadoh - Rice and meat",
    "Dohneiiong - Pork with black sesame",
    "Tungrymbai - Fermented soybean",
    "Kyat - Local beer"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is unique about Meghalayan society?", "options": ["Patriarchal", "Matrilineal", "Democratic", "Monarchic"], "correct": 1}
  ]}
]}'),

-- 17. Mizoram
('Land of the Hill People', 'Discover the vibrant culture of Mizoram', 'Aizawl', 'India', 'Mizo', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Mizoram, home to the Mizo people, is known for its bamboo forests and vibrant festivals."},
  {"type": "culture", "title": "Cultural Highlights", "items": [
    "Cheraw - Bamboo dance",
    "Chapchar Kut - Spring festival",
    "Mizo language and literature",
    "Traditional handloom"
  ]},
  {"type": "cuisine", "title": "Mizo Cuisine", "items": [
    "Bai - Boiled vegetables with herbs",
    "Vawksa Rep - Smoked pork",
    "Misa Mach Poora - Grilled shrimp",
    "Zu - Rice beer"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Cheraw?", "options": ["Bamboo dance", "A festival", "A dish", "A temple"], "correct": 0}
  ]}
]}'),

-- 18. Nagaland
('Land of Festivals - Nagaland', 'Experience the warrior culture and festivals', 'Kohima', 'India', 'English', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Nagaland, the Land of Festivals, is home to various Naga tribes with unique traditions."},
  {"type": "culture", "title": "Cultural Heritage", "items": [
    "Hornbill Festival - Festival of festivals",
    "Tribal warrior traditions",
    "Naga folk songs and dances",
    "Traditional shawls and crafts"
  ]},
  {"type": "cuisine", "title": "Naga Cuisine", "items": [
    "Smoked pork with bamboo shoot",
    "Axone - Fermented soybean",
    "Anishi - Fermented yam leaves",
    "Raja Mircha - Ghost pepper"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Hornbill Festival?", "options": ["Bird watching", "Festival of festivals", "Dance competition", "Food festival"], "correct": 1}
  ]}
]}'),

-- 19. Odisha
('Ancient Odisha - Land of Jagannath', 'Explore the classical dance and temples', 'Bhubaneswar', 'India', 'Odia', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Odisha, home to the Jagannath Temple and classical Odissi dance, has a rich cultural heritage."},
  {"type": "language", "title": "Odia Basics", "phrases": [
    {"odia": "Namaskar", "english": "Hello", "pronunciation": "na-mas-kar"},
    {"odia": "Kemiti achanti", "english": "How are you?", "pronunciation": "ke-mi-ti a-chan-ti"},
    {"odia": "Dhanyabad", "english": "Thank you", "pronunciation": "dhan-ya-baad"}
  ]},
  {"type": "culture", "title": "Cultural Treasures", "items": [
    "Odissi - Classical dance",
    "Jagannath Rath Yatra",
    "Konark Sun Temple - UNESCO site",
    "Pattachitra paintings"
  ]},
  {"type": "cuisine", "title": "Odia Cuisine", "items": [
    "Dalma - Lentils with vegetables",
    "Pakhala Bhata - Fermented rice",
    "Chenna Poda - Cottage cheese dessert",
    "Rasagola - Sweet dish"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Odissi?", "options": ["A temple", "Classical dance", "A festival", "A dish"], "correct": 1}
  ]}
]}'),

-- 20. Punjab
('Vibrant Punjab - Land of Five Rivers', 'Experience the energetic Punjabi culture', 'Chandigarh', 'India', 'Punjabi', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Punjab, the Land of Five Rivers, is known for its vibrant culture, Bhangra, and Golden Temple."},
  {"type": "language", "title": "Punjabi Basics", "phrases": [
    {"punjabi": "Sat Sri Akal", "english": "Hello (Sikh greeting)", "pronunciation": "sat sri a-kaal"},
    {"punjabi": "Ki haal hai", "english": "How are you?", "pronunciation": "ki haal hai"},
    {"punjabi": "Shukriya", "english": "Thank you", "pronunciation": "shu-kri-ya"}
  ]},
  {"type": "culture", "title": "Cultural Heritage", "items": [
    "Bhangra - Energetic folk dance",
    "Golden Temple - Holiest Sikh shrine",
    "Vaisakhi - Harvest festival",
    "Punjabi music and poetry"
  ]},
  {"type": "cuisine", "title": "Punjabi Food", "items": [
    "Sarson da Saag with Makki di Roti",
    "Butter Chicken",
    "Lassi",
    "Chole Bhature"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Bhangra?", "options": ["A dish", "Folk dance", "A temple", "A language"], "correct": 1},
    {"question": "What is the holiest Sikh shrine?", "options": ["Red Fort", "Golden Temple", "Taj Mahal", "Qutub Minar"], "correct": 1}
  ]}
]}');