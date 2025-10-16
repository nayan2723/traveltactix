-- Insert remaining Indian states cultural lessons

INSERT INTO cultural_lessons (title, description, city, country, language, difficulty_level, cultural_xp, duration_minutes, lesson_data) VALUES

-- 21. Rajasthan
('Royal Rajasthan Culture', 'Discover the land of kings and forts', 'Jaipur', 'India', 'Hindi', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Rajasthan, the Land of Kings, is famous for its forts, palaces, and vibrant folk culture."},
  {"type": "language", "title": "Rajasthani Phrases", "phrases": [
    {"rajasthani": "Khamma Ghani", "english": "Hello/Greetings", "pronunciation": "kham-ma gha-ni"},
    {"rajasthani": "Padharo Mhare Desh", "english": "Welcome to my country", "pronunciation": "pad-ha-ro mha-re desh"}
  ]},
  {"type": "culture", "title": "Cultural Heritage", "items": [
    "Ghoomar and Kalbelia - Folk dances",
    "Pushkar Camel Fair",
    "Miniature paintings",
    "Jaipur - Pink City"
  ]},
  {"type": "cuisine", "title": "Rajasthani Food", "items": [
    "Dal Baati Churma",
    "Laal Maas - Spicy mutton",
    "Ghewar - Sweet dish",
    "Ker Sangri - Desert beans"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Ghoomar?", "options": ["A fort", "Folk dance", "A dish", "A fair"], "correct": 1}
  ]}
]}'),

-- 22. Sikkim
('Himalayan Kingdom - Sikkim', 'Experience the mountain paradise culture', 'Gangtok', 'India', 'Nepali', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Sikkim, a former kingdom in the Himalayas, blends Nepali, Bhutia, and Lepcha cultures."},
  {"type": "culture", "title": "Cultural Elements", "items": [
    "Buddhist monasteries",
    "Losoong - Sikkimese New Year",
    "Kanchenjunga - Third highest peak",
    "Rumtek Monastery"
  ]},
  {"type": "cuisine", "title": "Sikkimese Cuisine", "items": [
    "Momos - Dumplings",
    "Thukpa - Noodle soup",
    "Gundruk - Fermented leafy greens",
    "Chhurpi - Hardened cheese"
  ]},
  {"type": "quiz", "questions": [
    {"question": "Which peak is visible from Sikkim?", "options": ["Everest", "Kanchenjunga", "K2", "Nanda Devi"], "correct": 1}
  ]}
]}'),

-- 23. Tamil Nadu
('Tamil Culture and Temples', 'Explore the ancient Dravidian heritage', 'Chennai', 'India', 'Tamil', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Tamil Nadu, with its ancient Dravidian culture, is famous for temples, classical arts, and literature."},
  {"type": "language", "title": "Tamil Basics", "phrases": [
    {"tamil": "Vanakkam", "english": "Hello", "pronunciation": "va-nak-kam"},
    {"tamil": "Eppadi irukkirgal", "english": "How are you?", "pronunciation": "ep-pa-di i-ruk-kir-gal"},
    {"tamil": "Nandri", "english": "Thank you", "pronunciation": "nan-dri"}
  ]},
  {"type": "culture", "title": "Cultural Heritage", "items": [
    "Bharatanatyam - Classical dance",
    "Pongal - Harvest festival",
    "Dravidian temple architecture",
    "Carnatic music"
  ]},
  {"type": "cuisine", "title": "Tamil Cuisine", "items": [
    "Idli, Dosa, Vada",
    "Sambar and Rasam",
    "Chettinad Chicken",
    "Filter Coffee"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Bharatanatyam?", "options": ["A temple", "Classical dance", "A festival", "A dish"], "correct": 1},
    {"question": "Which is the harvest festival of Tamil Nadu?", "options": ["Diwali", "Pongal", "Onam", "Baisakhi"], "correct": 1}
  ]}
]}'),

-- 24. Telangana
('Telangana Culture and Heritage', 'Discover the newest state rich culture', 'Hyderabad', 'India', 'Telugu', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Telangana, Indias youngest state, has a rich cultural heritage with Hyderabadi influences."},
  {"type": "language", "title": "Telugu Basics", "phrases": [
    {"telugu": "Namaskaram", "english": "Hello", "pronunciation": "na-mas-ka-ram"},
    {"telugu": "Ela unnaru", "english": "How are you?", "pronunciation": "e-la un-na-ru"}
  ]},
  {"type": "culture", "title": "Cultural Elements", "items": [
    "Bonalu Festival",
    "Bathukamma - Floral festival",
    "Charminar - Iconic monument",
    "Perini Shivatandavam - Dance"
  ]},
  {"type": "cuisine", "title": "Telangana Cuisine", "items": [
    "Hyderabadi Biryani",
    "Mirchi ka Salan",
    "Double ka Meetha",
    "Qubani ka Meetha"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Bathukamma?", "options": ["A dance", "Floral festival", "A temple", "A dish"], "correct": 1}
  ]}
]}'),

-- 25. Tripura
('Land of Diversity - Tripura', 'Experience the tribal culture and natural beauty', 'Agartala', 'India', 'Bengali', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Tripura, a small northeastern state, has a blend of tribal and Bengali cultures."},
  {"type": "culture", "title": "Cultural Heritage", "items": [
    "Garia Puja - Tribal festival",
    "Hojagiri dance",
    "Ujjayanta Palace",
    "Bamboo and cane handicrafts"
  ]},
  {"type": "cuisine", "title": "Tripuri Cuisine", "items": [
    "Mui Borok - Traditional dish",
    "Gudok - Mixed vegetables",
    "Chakhwi - Bamboo shoot chutney",
    "Wahan Mosdeng - Pork with onions"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Hojagiri?", "options": ["A festival", "A dance", "A dish", "A palace"], "correct": 1}
  ]}
]}'),

-- 26. Uttar Pradesh
('Cultural Capital - Uttar Pradesh', 'Explore the heartland of Indian culture', 'Lucknow', 'India', 'Hindi', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Uttar Pradesh, home to Taj Mahal and Varanasi, is the cultural and spiritual heart of India."},
  {"type": "language", "title": "Hindi/Urdu Phrases", "phrases": [
    {"hindi": "Namaste", "english": "Hello", "pronunciation": "na-mas-te"},
    {"urdu": "Adaab", "english": "Respectful greeting", "pronunciation": "a-daab"},
    {"hindi": "Shukriya", "english": "Thank you", "pronunciation": "shu-kri-ya"}
  ]},
  {"type": "culture", "title": "Cultural Treasures", "items": [
    "Taj Mahal - UNESCO World Heritage Site",
    "Varanasi - Oldest living city",
    "Kathak - Classical dance",
    "Awadhi culture and tehzeeb"
  ]},
  {"type": "cuisine", "title": "UP Cuisine", "items": [
    "Awadhi Biryani",
    "Kebabs - Tunday, Galawati",
    "Petha - Sweet from Agra",
    "Chaat"
  ]},
  {"type": "quiz", "questions": [
    {"question": "Where is the Taj Mahal located?", "options": ["Delhi", "Agra", "Jaipur", "Lucknow"], "correct": 1},
    {"question": "What is Kathak?", "options": ["A monument", "Classical dance", "A festival", "A dish"], "correct": 1}
  ]}
]}'),

-- 27. Uttarakhand
('Dev Bhoomi - Uttarakhand', 'Discover the Land of Gods', 'Dehradun', 'India', 'Hindi', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Uttarakhand, the Land of Gods, is known for its sacred sites and Himalayan beauty."},
  {"type": "culture", "title": "Spiritual Heritage", "items": [
    "Char Dham - Four sacred sites",
    "Garhwali and Kumaoni culture",
    "Nanda Devi Festival",
    "Aipan - Traditional floor art"
  ]},
  {"type": "cuisine", "title": "Pahadi Cuisine", "items": [
    "Kafuli - Spinach curry",
    "Bhatt ki Churkani - Black bean",
    "Bal Mithai - Sweet from Almora",
    "Singodi - Sweet wrapped in leaves"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is Char Dham?", "options": ["Four mountains", "Four sacred sites", "Four rivers", "Four festivals"], "correct": 1}
  ]}
]}'),

-- 28. West Bengal
('Bengali Culture and Arts', 'Experience the cultural renaissance of Bengal', 'Kolkata', 'India', 'Bengali', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "West Bengal, the land of Tagore and Durga Puja, has a rich tradition of arts, literature, and festivals."},
  {"type": "language", "title": "Bengali Basics", "phrases": [
    {"bengali": "Nomoshkar", "english": "Hello", "pronunciation": "no-mosh-kar"},
    {"bengali": "Kemon acho", "english": "How are you?", "pronunciation": "ke-mon a-cho"},
    {"bengali": "Dhonnobad", "english": "Thank you", "pronunciation": "dhon-no-bad"}
  ]},
  {"type": "culture", "title": "Cultural Heritage", "items": [
    "Durga Puja - Biggest festival",
    "Rabindra Sangeet - Tagore songs",
    "Terracotta temples",
    "Baul music tradition"
  ]},
  {"type": "cuisine", "title": "Bengali Cuisine", "items": [
    "Machher Jhol - Fish curry",
    "Rosogolla and Sandesh - Sweets",
    "Luchi and Alur Dom",
    "Mishti Doi - Sweet yogurt"
  ]},
  {"type": "quiz", "questions": [
    {"question": "What is the biggest festival of Bengal?", "options": ["Holi", "Diwali", "Durga Puja", "Eid"], "correct": 2},
    {"question": "Who was Rabindranath Tagore?", "options": ["Freedom fighter", "Poet and Nobel laureate", "King", "Dancer"], "correct": 1}
  ]}
]}'),

-- 29. Union Territories - Delhi
('Delhi - Capital Culture', 'Explore the heart of India', 'New Delhi', 'India', 'Hindi', 'beginner', 30, 10,
'{"sections": [
  {"type": "introduction", "content": "Delhi, the capital of India, is a blend of ancient history and modern cosmopolitan culture."},
  {"type": "language", "title": "Hindi Basics", "phrases": [
    {"hindi": "Namaste", "english": "Hello", "pronunciation": "na-mas-te"},
    {"hindi": "Kaise ho", "english": "How are you?", "pronunciation": "kai-se ho"},
    {"hindi": "Dhanyavaad", "english": "Thank you", "pronunciation": "dhan-ya-vaad"}
  ]},
  {"type": "culture", "title": "Historical Sites", "items": [
    "Red Fort - Mughal architecture",
    "Qutub Minar - UNESCO site",
    "India Gate - War memorial",
    "Humayuns Tomb"
  ]},
  {"type": "cuisine", "title": "Delhi Street Food", "items": [
    "Chole Bhature",
    "Paranthe Wali Gali",
    "Butter Chicken",
    "Chaat - Street snacks"
  ]},
  {"type": "quiz", "questions": [
    {"question": "Which monument is a Mughal fortress?", "options": ["Qutub Minar", "Red Fort", "India Gate", "Lotus Temple"], "correct": 1}
  ]}
]}');

-- Create function to check and award cultural badges
CREATE OR REPLACE FUNCTION award_cultural_badges()
RETURNS TRIGGER AS $$
DECLARE
  user_lessons_count INTEGER;
  user_states_count INTEGER;
  user_language_lessons INTEGER;
  badge_record RECORD;
BEGIN
  -- Count total lessons completed
  SELECT COUNT(DISTINCT lesson_id) INTO user_lessons_count
  FROM user_cultural_progress
  WHERE user_id = NEW.user_id AND progress_type = 'lesson';

  -- Count unique states completed
  SELECT COUNT(DISTINCT cl.city) INTO user_states_count
  FROM user_cultural_progress ucp
  JOIN cultural_lessons cl ON ucp.lesson_id = cl.id
  WHERE ucp.user_id = NEW.user_id AND ucp.progress_type = 'lesson';

  -- Count language lessons
  SELECT COUNT(DISTINCT lesson_id) INTO user_language_lessons
  FROM user_cultural_progress
  WHERE user_id = NEW.user_id 
  AND progress_type = 'lesson'
  AND completion_data->>'language_practiced' = 'true';

  -- Check and award badges based on criteria
  FOR badge_record IN 
    SELECT id, criteria FROM badges WHERE badge_type = 'cultural'
  LOOP
    -- Check if user already has this badge
    IF NOT EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_id = NEW.user_id AND badge_id = badge_record.id
    ) THEN
      -- Award based on criteria
      IF (badge_record.criteria->>'lessons_completed')::INTEGER IS NOT NULL 
         AND user_lessons_count >= (badge_record.criteria->>'lessons_completed')::INTEGER THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
      END IF;

      IF (badge_record.criteria->>'states_completed')::INTEGER IS NOT NULL 
         AND user_states_count >= (badge_record.criteria->>'states_completed')::INTEGER THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
      END IF;

      IF (badge_record.criteria->>'language_lessons')::INTEGER IS NOT NULL 
         AND user_language_lessons >= (badge_record.criteria->>'language_lessons')::INTEGER THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to award badges on lesson completion
DROP TRIGGER IF EXISTS trigger_award_cultural_badges ON user_cultural_progress;
CREATE TRIGGER trigger_award_cultural_badges
AFTER INSERT ON user_cultural_progress
FOR EACH ROW
EXECUTE FUNCTION award_cultural_badges();