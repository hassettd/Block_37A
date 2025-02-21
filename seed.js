const { Client } = require("pg");
// const bcrypt = require("bcryptjs");
const { client } = require("./common"); // Importing client from common.js
const bcrypt = require("bcryptjs");
// Seed function
const seed = async () => {
  try {
    await client.connect(); // Connect to the database

    // SQL to drop tables if they exist, and recreate them
    const SQL = `
      -- Drop tables if they exist
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS cars CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;

      -- Create users table
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );

      -- Create cars table
      CREATE TABLE cars (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL
      );

      -- Create reviews table
      CREATE TABLE reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
        review_text TEXT,
        score INT CHECK (score >= 1 AND score <= 5),
        UNIQUE(user_id, car_id)  -- Ensures a user can only leave one review per car
      );

       -- Create comments table
      CREATE TABLE comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

ALTER TABLE cars ADD COLUMN IF NOT EXISTS make VARCHAR(255);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS model VARCHAR(255);


      -- Insert data into cars table
      INSERT INTO cars (name, make, model)
VALUES
  ('Acura MDX', 'Acura', 'MDX'),
  ('Acura RDX', 'Acura', 'RDX'),
  ('Acura Integra', 'Acura', 'Integra'),
  ('Acura TSX', 'Acura', 'TSX'),
  ('Acura TLX', 'Acura', 'TLX'),
  ('Audi Q5', 'Audi', 'Q5'),
  ('Audi Q3', 'Audi', 'Q3'),
  ('Audi Q8', 'Audi', 'Q8'),
  ('Audi A3', 'Audi', 'A3'),
  ('Audi A4', 'Audi', 'A4'),
  ('Audi A5', 'Audi', 'A5'),
  ('Audi A6', 'Audi', 'A6'),
  ('Audi A7', 'Audi', 'A7'),
  ('Audi A8', 'Audi', 'A8'),
  ('BMW X3', 'BMW', 'X3'),
  ('BMW X1', 'BMW', 'X1'),
  ('BMW X2', 'BMW', 'X2'),
  ('BMW X4', 'BMW', 'X4'),
  ('BMW X5', 'BMW', 'X5'),
  ('BMW X6', 'BMW', 'X6'),
  ('BMW X7', 'BMW', 'X7'),
  ('BMW X M', 'BMW', 'X M'),
  ('BMW 230i', 'BMW', '230i'),
  ('BMW 330i', 'BMW', '330i'),
  ('BMW M435i', 'BMW', 'M435i'),
  ('BMW 530i', 'BMW', '530i'),
  ('BMW M750xi', 'BMW', 'M750xi'),
  ('BMW Z4', 'BMW', 'Z4'),
  ('Buick Enclave', 'Buick', 'Enclave'),
  ('Buick Encore', 'Buick', 'Encore'),
  ('Buick Envision', 'Buick', 'Envision'),
  ('Cadillac Escalade', 'Cadillac', 'Escalade'),
  ('Cadillac XT5', 'Cadillac', 'XT5'),
  ('Cadillac XT4', 'Cadillac', 'XT4'),
  ('Chevrolet Equinox', 'Chevrolet', 'Equinox'),
  ('Chevrolet Blazer', 'Chevrolet', 'Blazer'),
  ('Chevrolet Trax', 'Chevrolet', 'Trax'),
  ('Chevrolet Tahoe', 'Chevrolet', 'Tahoe'),
  ('Chevrolet Traverse', 'Chevrolet', 'Traverse'),
  ('Chevrolet Suburban', 'Chevrolet', 'Suburban'),
  ('Chevrolet Colorado', 'Chevrolet', 'Colorado'),
  ('Chevrolet Silverado', 'Chevrolet', 'Silverado'),
  ('Chrysler Pacifica', 'Chrysler', 'Pacifica'),
  ('Dodge Hornet', 'Dodge', 'Hornet'),
  ('Dodge Durango', 'Dodge', 'Durango'),
  ('Dodge Charger', 'Dodge', 'Charger'),
  ('Ford Mustang', 'Ford', 'Mustang'),
  ('Ford Maverick', 'Ford', 'Maverick'),
  ('Ford Ranger', 'Ford', 'Ranger'),
  ('Ford F150', 'Ford', 'F150'),
  ('Ford Bronco', 'Ford', 'Bronco'),
  ('Ford Bronco Sport', 'Ford', 'Bronco Sport'),
  ('Ford Escape', 'Ford', 'Escape'),
  ('Ford Edge', 'Ford', 'Edge'),
  ('Ford Flex', 'Ford', 'Flex'),
  ('Ford Explorer', 'Ford', 'Explorer'),
  ('Ford Expedition', 'Ford', 'Expedition'),
  ('GMC Yukon', 'GMC', 'Yukon'),
  ('GMC Terrain', 'GMC', 'Terrain'),
  ('GMC Arcadia', 'GMC', 'Arcadia'),
  ('GMC Yukon XL', 'GMC', 'Yukon XL'),
  ('GMC Sierra', 'GMC', 'Sierra'),
  ('GMC Canyon', 'GMC', 'Canyon'),
  ('Honda Civic', 'Honda', 'Civic'),
  ('Honda Accord', 'Honda', 'Accord'),
  ('Honda CR-V', 'Honda', 'CR-V'),
  ('Honda HR-V', 'Honda', 'HR-V'),
  ('Honda Passport', 'Honda', 'Passport'),
  ('Honda Pilot', 'Honda', 'Pilot'),
  ('Honda Odyssey', 'Honda', 'Odyssey'),
  ('Honda Ridgeline', 'Honda', 'Ridgeline'),
  ('Hyundai Sonata', 'Hyundai', 'Sonata'),
  ('Hyundai Accent', 'Hyundai', 'Accent'),
  ('Jeep Cherokee', 'Jeep', 'Cherokee'),
  ('Jeep Renegade', 'Jeep', 'Renegade'),
  ('Jeep Compass', 'Jeep', 'Compass'),
  ('Jeep Patriot', 'Jeep', 'Patriot'),
  ('Jeep Grand Cherokee', 'Jeep', 'Grand Cherokee'),
  ('Jeep Wagoneer', 'Jeep', 'Wagoneer'),
  ('Jeep Grand Wagoneer', 'Jeep', 'Grand Wagoneer'),
  ('KIA Optima', 'KIA', 'Optima'),
  ('KIA Carnival', 'KIA', 'Carnival'),
  ('Lexus ES350', 'Lexus', 'ES350'),
  ('Lexus GS350', 'Lexus', 'GS350'),
  ('Lexus LS500', 'Lexus', 'LS500'),
  ('Lexus IS300', 'Lexus', 'IS300'),
  ('Lexus UX200t', 'Lexus', 'UX200t'),
  ('Lexus NX200t', 'Lexus', 'NX200t'),
  ('Lexus RX350', 'Lexus', 'RX350'),
  ('Lexus TX350', 'Lexus', 'TX350'),
  ('Lexus GX550', 'Lexus', 'GX550'),
  ('Lexus LX600', 'Lexus', 'LX600'),
  ('Lexus LC500', 'Lexus', 'LC500'),
  ('Lexus RC350', 'Lexus', 'RC350'),
  ('Lincoln Navigator', 'Lincoln', 'Navigator'),
  ('Lincoln Aviator', 'Lincoln', 'Aviator'),
  ('Lincoln Corsair', 'Lincoln', 'Corsair'),
  ('Mazda Miata', 'Mazda', 'Miata'),
  ('Mercedes-Benz S600', 'Mercedes-Benz', 'S600'),
  ('Mercedes-Benz C230', 'Mercedes-Benz', 'C230'),
  ('Mercedes-Benz E350', 'Mercedes-Benz', 'E350'),
  ('Nissan Altima', 'Nissan', 'Altima'),
  ('Toyota Camry', 'Toyota', 'Camry'),
  ('Toyota Corolla', 'Toyota', 'Corolla'),
  ('Toyota Avalon', 'Toyota', 'Avalon'),
  ('Toyota Sienna', 'Toyota', 'Sienna'),
  ('Toyota Corolla Cross', 'Toyota', 'Corolla Cross'),
  ('Toyota RAV4', 'Toyota', 'RAV4'),
  ('Toyota Highlander', 'Toyota', 'Highlander'),
  ('Toyota Grand Highlander', 'Toyota', 'Grand Highlander'),
  ('Toyota 4Runner', 'Toyota', '4Runner'),
  ('Toyota Land Cruiser', 'Toyota', 'Land Cruiser'),
  ('Toyota Tacoma', 'Toyota', 'Tacoma'),
  ('Toyota Tundra', 'Toyota', 'Tundra'),
  ('Volkswagen Jetta', 'Volkswagen', 'Jetta'),
  ('Volkswagen Passat', 'Volkswagen', 'Passat'),
  ('Volkswagen Phaeton', 'Volkswagen', 'Phaeton'),
  ('Volvo V90', 'Volvo', 'V90');

      -- Insert data into users table (with hashed passwords)
      INSERT INTO users (username, email, password)
      VALUES
        ('john_doe', 'john.doe@example.com', '${await bcrypt.hash(
          "password123",
          10
        )}'),
        ('jane_doe', 'jane.doe@example.com', '${await bcrypt.hash(
          "password123",
          10
        )}'),
        ('alice_smith', 'alice.smith@example.com', '${await bcrypt.hash(
          "password123",
          10
        )}'),
        ('bob_johnson', 'bob.johnson@example.com', '${await bcrypt.hash(
          "password123",
          10
        )}'),
        ('charlie_brown', 'charlie.brown@example.com', '${await bcrypt.hash(
          "password123",
          10
        )}'),
    ('david_jones', 'david.jones@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('emma_davis', 'emma.davis@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('frank_miller', 'frank.miller@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('grace_wilson', 'grace.wilson@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('henry_moore', 'henry.moore@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('isla_taylor', 'isla.taylor@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('jackson_anderson', 'jackson.anderson@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('katie_thomas', 'katie.thomas@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('luke_lee', 'luke.lee@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('mia_harris', 'mia.harris@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('noah_king', 'noah.king@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('olivia_clark', 'olivia.clark@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('paul_rodgers', 'paul.rodgers@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('quinn_walker', 'quinn.walker@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('rachel_wood', 'rachel.wood@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('samuel_scarlett', 'samuel.scarlett@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('taylor_martin', 'taylor.martin@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('ursula_perez', 'ursula.perez@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('victor_garcia', 'victor.garcia@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('willow_hernandez', 'willow.hernandez@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('xander_baker', 'xander.baker@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('yasmine_hall', 'yasmine.hall@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}'),
    ('zoe_adams', 'zoe.adams@example.com', '${await bcrypt.hash(
      "password123",
      10
    )}');

      -- Insert data into reviews table
      INSERT INTO reviews (user_id, car_id, review_text, score)
      VALUES
            ((SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM cars WHERE name = 'Acura MDX'), 'Great car! Love the performance and comfort. Highly recommend.', 5),
    ((SELECT id FROM users WHERE username = 'jane_doe'), (SELECT id FROM cars WHERE name = 'Acura RDX'), 'Compact SUV with decent features, but interior could be better. 3 stars.', 3),
    ((SELECT id FROM users WHERE username = 'alice_smith'), (SELECT id FROM cars WHERE name = 'Acura Integra'), 'Classic style, but outdated. Would prefer more modern tech.', 2),
    ((SELECT id FROM users WHERE username = 'bob_johnson'), (SELECT id FROM cars WHERE name = 'Acura TSX'), 'Comfortable and reliable. A great daily commuter.', 4),
    ((SELECT id FROM users WHERE username = 'charlie_brown'), (SELECT id FROM cars WHERE name = 'Acura TLX'), 'Sporty and sleek design, handles beautifully. Would buy again.', 5),
    ((SELECT id FROM users WHERE username = 'david_jones'), (SELECT id FROM cars WHERE name = 'Audi Q5'), 'Good performance, but fuel economy could be better. Overall, solid choice.', 4),
    ((SELECT id FROM users WHERE username = 'emma_davis'), (SELECT id FROM cars WHERE name = 'Audi Q3'), 'Very compact. Not enough space for a family. Could be better.', 2),
    ((SELECT id FROM users WHERE username = 'frank_miller'), (SELECT id FROM cars WHERE name = 'Audi Q8'), 'Luxury car, great features, but quite expensive. Still worth it for the comfort.', 4),
    ((SELECT id FROM users WHERE username = 'grace_wilson'), (SELECT id FROM cars WHERE name = 'Audi A3'), 'Compact and sporty, but not great for families. Ideal for singles or couples.', 3),
    ((SELECT id FROM users WHERE username = 'henry_moore'), (SELECT id FROM cars WHERE name = 'Audi A4'), 'Solid car, great handling, but doesn’t feel as premium as I hoped for the price.', 3),
    ((SELECT id FROM users WHERE username = 'isla_taylor'), (SELECT id FROM cars WHERE name = 'Audi A5'), 'Stylish and fast, but backseat space is tight. Love the driving experience.', 4),
    ((SELECT id FROM users WHERE username = 'jackson_anderson'), (SELECT id FROM cars WHERE name = 'Audi A6'), 'Premium feel, fantastic ride quality, but a bit heavy on the wallet.', 4),
    ((SELECT id FROM users WHERE username = 'katie_thomas'), (SELECT id FROM cars WHERE name = 'Audi A7'), 'Great looks, great performance. I wish the infotainment system was more intuitive.', 4),
    ((SELECT id FROM users WHERE username = 'luke_lee'), (SELECT id FROM cars WHERE name = 'Audi A8'), 'Ultimate luxury sedan. Feels like a dream to drive.', 5),
    ((SELECT id FROM users WHERE username = 'mia_harris'), (SELECT id FROM cars WHERE name = 'BMW X3'), 'Comfortable and fast, but I expect better technology features for the price.', 4),
    ((SELECT id FROM users WHERE username = 'noah_king'), (SELECT id FROM cars WHERE name = 'BMW X1'), 'Great compact SUV, fun to drive, but small backseat.', 3),
    ((SELECT id FROM users WHERE username = 'olivia_clark'), (SELECT id FROM cars WHERE name = 'BMW X2'), 'Sporty and agile, but fuel economy could be improved.', 3),
    ((SELECT id FROM users WHERE username = 'paul_rodgers'), (SELECT id FROM cars WHERE name = 'BMW X4'), 'Solid handling, and the M Sport version is a blast to drive. Expensive, but fun.', 4),
    ((SELECT id FROM users WHERE username = 'quinn_walker'), (SELECT id FROM cars WHERE name = 'BMW X5'), 'Love the luxury feel and performance. Still, a bit pricey for what you get.', 4),
    ((SELECT id FROM users WHERE username = 'rachel_wood'), (SELECT id FROM cars WHERE name = 'BMW X6'), 'Impressive ride but feels clunky around turns. Not my favorite BMW SUV.', 3),
    ((SELECT id FROM users WHERE username = 'samuel_scarlett'), (SELECT id FROM cars WHERE name = 'BMW X7'), 'A true luxury SUV. Spacious, fast, and smooth. Perfect family car!', 5),
    ((SELECT id FROM users WHERE username = 'taylor_martin'), (SELECT id FROM cars WHERE name = 'BMW X M'), 'Incredible performance, great handling. A bit too much for everyday use though.', 4),
    ((SELECT id FROM users WHERE username = 'ursula_perez'), (SELECT id FROM cars WHERE name = 'BMW 230i'), 'Compact and nimble. Fun for city driving, but not the most practical.', 3),
    ((SELECT id FROM users WHERE username = 'victor_garcia'), (SELECT id FROM cars WHERE name = 'BMW 330i'), 'Classic BMW. Smooth drive and high quality interior.', 4),
    ((SELECT id FROM users WHERE username = 'willow_hernandez'), (SELECT id FROM cars WHERE name = 'BMW M435i'), 'Fantastic acceleration and handling, but harsh ride quality.', 4),
    ((SELECT id FROM users WHERE username = 'xander_baker'), (SELECT id FROM cars WHERE name = 'BMW 530i'), 'Great balance between comfort and performance, though the tech feels outdated.', 4),
    ((SELECT id FROM users WHERE username = 'yasmine_hall'), (SELECT id FROM cars WHERE name = 'BMW M750xi'), 'Luxurious and fast, but hard to justify the price compared to other brands.', 3),
    ((SELECT id FROM users WHERE username = 'zoe_adams'), (SELECT id FROM cars WHERE name = 'BMW Z4'), 'Fun to drive, but the ride is a bit stiff. Excellent handling though!', 4),
    ((SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM cars WHERE name = 'Buick Enclave'), 'Spacious and comfortable, but a bit too large for my taste.', 3),
    ((SELECT id FROM users WHERE username = 'alice_smith'), (SELECT id FROM cars WHERE name = 'Buick Encore'), 'Perfect for city driving. Small but functional. Solid car for the price.', 4),
    ((SELECT id FROM users WHERE username = 'bob_johnson'), (SELECT id FROM cars WHERE name = 'Buick Envision'), 'Smooth ride, but I was expecting more features for the price.', 3),
    ((SELECT id FROM users WHERE username = 'charlie_brown'), (SELECT id FROM cars WHERE name = 'Cadillac Escalade'), 'The epitome of luxury. Stylish, comfortable, and packed with features.', 5),
    ((SELECT id FROM users WHERE username = 'david_jones'), (SELECT id FROM cars WHERE name = 'Cadillac XT5'), 'Sleek design, solid driving experience. Not the best in terms of fuel efficiency though.', 4),
    ((SELECT id FROM users WHERE username = 'emma_davis'), (SELECT id FROM cars WHERE name = 'Cadillac XT4'), 'Good quality and luxurious feel, but a bit small for my family.', 3),
    ((SELECT id FROM users WHERE username = 'frank_miller'), (SELECT id FROM cars WHERE name = 'Chevrolet Equinox'), 'Affordable and spacious, but could use more advanced tech features.', 3),
    ((SELECT id FROM users WHERE username = 'grace_wilson'), (SELECT id FROM cars WHERE name = 'Chevrolet Blazer'), 'Stylish and fun to drive, but not the most comfortable for long trips.', 3),
    ((SELECT id FROM users WHERE username = 'henry_moore'), (SELECT id FROM cars WHERE name = 'Chevrolet Trax'), 'Great value for the price, compact yet functional.', 4),
    ((SELECT id FROM users WHERE username = 'isla_taylor'), (SELECT id FROM cars WHERE name = 'Chevrolet Tahoe'), 'Perfect for road trips. Spacious and smooth ride, but not great on fuel economy.', 4),
    ((SELECT id FROM users WHERE username = 'jackson_anderson'), (SELECT id FROM cars WHERE name = 'Chevrolet Traverse'), 'Comfortable family car, but feels a little underpowered at times.', 3),
    ((SELECT id FROM users WHERE username = 'katie_thomas'), (SELECT id FROM cars WHERE name = 'Chevrolet Suburban'), 'Big, comfortable, and packed with space. Ideal for large families or trips.', 5),
    ((SELECT id FROM users WHERE username = 'luke_lee'), (SELECT id FROM cars WHERE name = 'Chevrolet Colorado'), 'Great work truck. Solid performance and durability.', 4),
    ((SELECT id FROM users WHERE username = 'mia_harris'), (SELECT id FROM cars WHERE name = 'Chevrolet Silverado'), 'Perfect truck for work. Durable and reliable.  I get nearly 26 miles per gallon on the freeway.', 5),
    ((SELECT id FROM users WHERE username = 'noah_king'), (SELECT id FROM cars WHERE name = 'Chrysler Pacifica'), 'Fantastic family car. Comfortable and well equipped.', 4),
    ((SELECT id FROM users WHERE username = 'olivia_clark'), (SELECT id FROM cars WHERE name = 'Dodge Hornet'), 'Not my style. Felt small and underpowered for a compact SUV.', 2),
    ((SELECT id FROM users WHERE username = 'paul_rodgers'), (SELECT id FROM cars WHERE name = 'Dodge Durango'), 'Solid SUV for families, but fuel economy is not the best.', 3),
    ((SELECT id FROM users WHERE username = 'quinn_walker'), (SELECT id FROM cars WHERE name = 'Dodge Charger'), 'Powerful and fast, but handling could be better.', 4),
    ((SELECT id FROM users WHERE username = 'rachel_wood'), (SELECT id FROM cars WHERE name = 'Ford Mustang'), 'A fun ride, but not ideal for everyday driving (especially in snow!)', 3),
    ((SELECT id FROM users WHERE username = 'samuel_scarlett'), (SELECT id FROM cars WHERE name = 'Ford Maverick'), 'Great value for the price, but a little too small for my needs.', 3),
    ((SELECT id FROM users WHERE username = 'taylor_martin'), (SELECT id FROM cars WHERE name = 'Ford Ranger'), 'Solid pickup, but a little too basic for the price.', 3),
    ((SELECT id FROM users WHERE username = 'ursula_perez'), (SELECT id FROM cars WHERE name = 'Ford F150'), 'The best work truck hands down. Rugged, reliable, and powerful.', 5),
    ((SELECT id FROM users WHERE username = 'victor_garcia'), (SELECT id FROM cars WHERE name = 'Ford Bronco'), 'Great off-roading capability, but not the best on pavement.', 4),
    ((SELECT id FROM users WHERE username = 'willow_hernandez'), (SELECT id FROM cars WHERE name = 'Ford Bronco Sport'), 'Good for light off-roading, but not as capable as the full Bronco.', 3),
    ((SELECT id FROM users WHERE username = 'xander_baker'), (SELECT id FROM cars WHERE name = 'Ford Escape'), 'Great for city driving, but lacks power for highway cruising.', 3),
    ((SELECT id FROM users WHERE username = 'yasmine_hall'), (SELECT id FROM cars WHERE name = 'Ford Edge'), 'Comfortable but could use better tech integration.', 3),
    ((SELECT id FROM users WHERE username = 'zoe_adams'), (SELECT id FROM cars WHERE name = 'Ford Flex'), 'Unique design and roomy, but too boxy for my liking.', 3);
    
    -- Insert data into comments table
      INSERT INTO comments (user_id, review_id, comment_text)
VALUES
  ((SELECT id FROM users WHERE username = 'john_doe'), 
   (SELECT id FROM reviews WHERE review_text = 'Great car! Love the performance and comfort. Highly recommend.'), 
   'I completely agree with this review! Amazing vehicle.'),
  
  ((SELECT id FROM users WHERE username = 'alice_smith'), 
   (SELECT id FROM reviews WHERE review_text = 'Compact SUV with decent features, but interior could be better.'), 
   'I feel the same! The exterior looks great, but I wish the interior had more premium materials.'),
  
  ((SELECT id FROM users WHERE username = 'bob_johnson'), 
   (SELECT id FROM reviews WHERE review_text = 'Classic style, but outdated. Would prefer more modern tech.'), 
   'Agreed! The style is nice, but it definitely needs some modern features to keep up with newer models.'),
  
  ((SELECT id FROM users WHERE username = 'jane_doe'), 
   (SELECT id FROM reviews WHERE review_text = 'Comfortable and reliable. A great daily commuter.'), 
   'Exactly! This car is a great choice for daily use. It’s reliable and gets me through the week without any issues.'),
  
  ((SELECT id FROM users WHERE username = 'charlie_brown'), 
   (SELECT id FROM reviews WHERE review_text = 'Sporty and sleek design, handles beautifully. Would buy again.'), 
   'Couldn’t agree more! The handling is incredible, and the design is stunning. Definitely would buy again!'),
  
  ((SELECT id FROM users WHERE username = 'david_jones'), 
   (SELECT id FROM reviews WHERE review_text = 'Good performance, but fuel economy could be better.'), 
   'True! It performs well, but I think they could have done better with fuel efficiency.'),
  
  ((SELECT id FROM users WHERE username = 'emma_davis'), 
   (SELECT id FROM reviews WHERE review_text = 'Very compact. Not enough space for a family. Could be better.'), 
   'Definitely agree! It’s a great car for city driving, but not the best for families who need more space.'),
  
  ((SELECT id FROM users WHERE username = 'frank_miller'), 
   (SELECT id FROM reviews WHERE review_text = 'Luxury car, great features, but quite expensive. Still worth it for the comfort.'), 
   'I think it’s totally worth the price if you value comfort and luxury. The features are amazing!'),
  
  ((SELECT id FROM users WHERE username = 'grace_wilson'), 
   (SELECT id FROM reviews WHERE review_text = 'Compact and sporty, but not great for families. Ideal for singles or couples.'), 
   'Exactly! It’s a perfect car for those who love driving, but not ideal for families with kids.'),
  
  ((SELECT id FROM users WHERE username = 'henry_moore'), 
   (SELECT id FROM reviews WHERE review_text = 'Solid car, great handling, but doesn’t feel as premium as I hoped for the price.'), 
   'I was expecting more of a premium feel too, especially for the price. The handling is good, though.'),
  
  ((SELECT id FROM users WHERE username = 'isla_taylor'), 
   (SELECT id FROM reviews WHERE review_text = 'Stylish and fast, but backseat space is tight. Love the driving experience.'), 
   'The driving experience is amazing, but yeah, the backseat could definitely use some more room.'),
  
  ((SELECT id FROM users WHERE username = 'jackson_anderson'), 
   (SELECT id FROM reviews WHERE review_text = 'Premium feel, fantastic ride quality, but a bit heavy on the wallet.'), 
   'It’s a bit pricey, but I think it’s worth the investment for the luxury and ride quality.'),
  
  ((SELECT id FROM users WHERE username = 'katie_thomas'), 
   (SELECT id FROM reviews WHERE review_text = 'Great looks, great performance. I wish the infotainment system was more intuitive.'), 
   'Great car overall, but I agree with you. The infotainment system could use some improvement.'),
  
  ((SELECT id FROM users WHERE username = 'luke_lee'), 
   (SELECT id FROM reviews WHERE review_text = 'Ultimate luxury sedan. Feels like a dream to drive.'), 
   'This is by far one of the best driving experiences I’ve had. It’s like driving on clouds!'),
  
  ((SELECT id FROM users WHERE username = 'mia_harris'), 
   (SELECT id FROM reviews WHERE review_text = 'Comfortable and fast, but I expect better technology features for the price.'), 
   'The car is quick and comfy, but I think the tech features could be updated to match the price.'),
  
  ((SELECT id FROM users WHERE username = 'noah_king'), 
   (SELECT id FROM reviews WHERE review_text = 'Great compact SUV, fun to drive, but small backseat.'), 
   'I love how it handles, but I wish the backseat was a bit roomier for passengers.'),
  
  ((SELECT id FROM users WHERE username = 'olivia_clark'), 
   (SELECT id FROM reviews WHERE review_text = 'Sporty and agile, but fuel economy could be improved.'), 
   'The car is fun to drive, but yeah, fuel economy is something they could improve.'),
  
  ((SELECT id FROM users WHERE username = 'paul_rodgers'), 
   (SELECT id FROM reviews WHERE review_text = 'Solid handling, and the M Sport version is a blast to drive. Expensive, but fun.'), 
   'The M Sport version is insane! It’s a bit pricey, but definitely worth it for the driving experience.'),
  
  ((SELECT id FROM users WHERE username = 'quinn_walker'), 
   (SELECT id FROM reviews WHERE review_text = 'Love the luxury feel and performance. Still, a bit pricey for what you get.'), 
   'The luxury is amazing, but I agree, the price is a bit steep for what’s offered.'),
  
  ((SELECT id FROM users WHERE username = 'rachel_wood'), 
   (SELECT id FROM reviews WHERE review_text = 'Impressive ride but feels clunky around turns. Not my favorite BMW SUV.'), 
   'The ride is great, but I’ve noticed it gets a bit clunky on sharp turns. Not my favorite either.');
    
    `;

    // Execute the SQL script to drop, create, and insert data
    await client.query(SQL);

    console.log("Database seeded successfully!");

    // Close the client connection after seeding
    await client.end();
  } catch (err) {
    console.error("Error seeding the database:", err);
    await client.end();
  }
};

// Run the seed function
seed();
// const { client } = require("./common");

// const seed = async () => {
//   try {
//     await client.connect();

//     const SQL = `
//       -- Drop the tables first if they exist
//       DROP TABLE IF EXISTS cars CASCADE;
//       DROP TABLE IF EXISTS body;

//       -- Create the body table
//       CREATE TABLE body(
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         type VARCHAR(100)
//       );

//       -- Insert values into body table
//       INSERT INTO body(type)
//       VALUES
//         ('SUV'),
//         ('Sedan'),
//         ('Convertible'),
//         ('Coupe'),
//         ('Minivan'),
//         ('Truck'),
//         ('Wagon');

//       -- Create cars table with a reference to body
//       CREATE TABLE cars(
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         name VARCHAR(100),
//         body_id UUID REFERENCES body(id) NOT NULL
//       );

//       -- Insert values into cars table, linking to body via body_id
//       INSERT INTO cars(name, body_id)
//       VALUES
//         ('Acura MDX', (SELECT id FROM body WHERE type ='SUV')),
//         ('Acura RDX', (SELECT id FROM body WHERE type ='SUV')),
//         ('Acura Integra', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Acura TSX', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Acura TLX', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Audi Q5', (SELECT id FROM body WHERE type ='SUV')),
//         ('Audi Q3', (SELECT id FROM body WHERE type ='SUV')),
//         ('Audi Q8', (SELECT id FROM body WHERE type ='SUV')),
//         ('Audi A3', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Audi A4', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Audi A5', (SELECT id FROM body WHERE type ='Convertible')),
//         ('Audi A6', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Audi A7', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Audi A8', (SELECT id FROM body WHERE type ='Sedan')),
//         ('BMW X3', (SELECT id FROM body WHERE type ='SUV')),
//         ('BMW X1', (SELECT id FROM body WHERE type ='SUV')),
//         ('BMW X2', (SELECT id FROM body WHERE type ='SUV')),
//         ('BMW X4', (SELECT id FROM body WHERE type ='SUV')),
//         ('BMW X5', (SELECT id FROM body WHERE type ='SUV')),
//         ('BMW X6', (SELECT id FROM body WHERE type ='SUV')),
//         ('BMW X7', (SELECT id FROM body WHERE type ='SUV')),
//         ('BMW X M', (SELECT id FROM body WHERE type ='SUV')),
//         ('BMW 230i', (SELECT id FROM body WHERE type ='Sedan')),
//         ('BMW 330i', (SELECT id FROM body WHERE type ='Sedan')),
//         ('BMW M435i', (SELECT id FROM body WHERE type ='Convertible')),
//         ('BMW 530i', (SELECT id FROM body WHERE type ='Sedan')),
//         ('BMW M750xi', (SELECT id FROM body WHERE type ='Sedan')),
//         ('BMW Z4', (SELECT id FROM body WHERE type ='Convertible')),
//         ('Buick Enclave', (SELECT id FROM body WHERE type ='SUV')),
//         ('Buick Encore', (SELECT id FROM body WHERE type ='SUV')),
//         ('Buick Envision', (SELECT id FROM body WHERE type ='SUV')),
//         ('Cadillac Escalade', (SELECT id FROM body WHERE type ='SUV')),
//         ('Cadillac XT5', (SELECT id FROM body WHERE type ='SUV')),
//         ('Cadillac XT4', (SELECT id FROM body WHERE type ='SUV')),
//         ('Chevrolet Equinox', (SELECT id FROM body WHERE type ='SUV')),
//         ('Chevrolet Blazer', (SELECT id FROM body WHERE type ='SUV')),
//         ('Chevrolet Trax', (SELECT id FROM body WHERE type ='SUV')),
//         ('Chevrolet Tahoe', (SELECT id FROM body WHERE type ='SUV')),
//         ('Chevrolet Traverse', (SELECT id FROM body WHERE type ='SUV')),
//         ('Chevrolet Suburban', (SELECT id FROM body WHERE type ='SUV')),
//         ('Chevrolet Colorado', (SELECT id FROM body WHERE type ='Truck')),
//         ('Chevrolet Silverado', (SELECT id FROM body WHERE type ='Truck')),
//         ('Chrysler Pacifica', (SELECT id FROM body WHERE type ='Minivan')),
//         ('Dodge Hornet', (SELECT id FROM body WHERE type ='SUV')),
//         ('Dodge Durango', (SELECT id FROM body WHERE type ='SUV')),
//         ('Dodge Charger', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Ford Mustang', (SELECT id FROM body WHERE type ='Coupe')),
//         ('Ford Maverick', (SELECT id FROM body WHERE type ='Truck')),
//         ('Ford Ranger', (SELECT id FROM body WHERE type ='Truck')),
//         ('Ford F150', (SELECT id FROM body WHERE type ='Truck')),
//         ('Ford Bronco', (SELECT id FROM body WHERE type ='SUV')),
//         ('Ford Bronco Sport', (SELECT id FROM body WHERE type ='SUV')),
//         ('Ford Escape', (SELECT id FROM body WHERE type ='SUV')),
//         ('Ford Edge', (SELECT id FROM body WHERE type ='SUV')),
//         ('Ford Flex', (SELECT id FROM body WHERE type ='SUV')),
//         ('Ford Explorer', (SELECT id FROM body WHERE type ='SUV')),
//         ('Ford Expedition', (SELECT id FROM body WHERE type ='SUV')),
//         ('GMC Yukon', (SELECT id FROM body WHERE type ='SUV')),
//         ('GMC Terrain', (SELECT id FROM body WHERE type ='SUV')),
//         ('GMC Arcadia', (SELECT id FROM body WHERE type ='SUV')),
//         ('GMC Yukon XL', (SELECT id FROM body WHERE type ='SUV')),
//         ('GMC Sierra', (SELECT id FROM body WHERE type ='Truck')),
//         ('GMC Canyon', (SELECT id FROM body WHERE type ='Truck')),
//         ('Honda Civic', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Honda Accord', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Honda CR-V', (SELECT id FROM body WHERE type ='SUV')),
//         ('Honda HR-V', (SELECT id FROM body WHERE type ='SUV')),
//         ('Honda Passport', (SELECT id FROM body WHERE type ='SUV')),
//         ('Honda Pilot', (SELECT id FROM body WHERE type ='SUV')),
//         ('Honda Odyssey', (SELECT id FROM body WHERE type ='Minivan')),
//         ('Honda Ridgeline', (SELECT id FROM body WHERE type ='Truck')),
//         ('Hyundai Sonata', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Hyundai Accent', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Jeep Cherokee', (SELECT id FROM body WHERE type ='SUV')),
//         ('Jeep Renegade', (SELECT id FROM body WHERE type ='SUV')),
//         ('Jeep Compass', (SELECT id FROM body WHERE type ='SUV')),
//         ('Jeep Patriot', (SELECT id FROM body WHERE type ='SUV')),
//         ('Jeep Grand Cherokee', (SELECT id FROM body WHERE type ='SUV')),
//         ('Jeep Wagoneer', (SELECT id FROM body WHERE type ='SUV')),
//         ('Jeep Grand Wagoneer', (SELECT id FROM body WHERE type ='SUV')),
//         ('KIA Optima', (SELECT id FROM body WHERE type ='Sedan')),
//         ('KIA Carnival', (SELECT id FROM body WHERE type ='Minivan')),
//         ('Lexus ES350', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Lexus GS350', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Lexus LS500', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Lexus IS300', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Lexus UX200t', (SELECT id FROM body WHERE type ='SUV')),
//         ('Lexus NX200t', (SELECT id FROM body WHERE type ='SUV')),
//         ('Lexus RX350', (SELECT id FROM body WHERE type ='SUV')),
//         ('Lexus TX350', (SELECT id FROM body WHERE type ='SUV')),
//         ('Lexus GX550', (SELECT id FROM body WHERE type ='SUV')),
//         ('Lexus LX600', (SELECT id FROM body WHERE type ='SUV')),
//         ('Lexus LC500', (SELECT id FROM body WHERE type ='Coupe')),
//         ('Lexus RC350', (SELECT id FROM body WHERE type ='Coupe')),
//         ('Lincoln Navigator', (SELECT id FROM body WHERE type ='SUV')),
//         ('Lincoln Aviator', (SELECT id FROM body WHERE type ='SUV')),
//         ('Lincoln Corsair', (SELECT id FROM body WHERE type ='SUV')),
//         ('Mazda Miata', (SELECT id FROM body WHERE type ='Convertible')),
//         ('Mercedes-Benz S600', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Mercedes-Benz C230', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Mercedes-Benz E350', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Nissan Altima', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Toyota Camry', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Toyota Corolla', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Toyota Avalon', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Toyota Sienna', (SELECT id FROM body WHERE type ='Minivan')),
//         ('Toyota Corolla Cross', (SELECT id FROM body WHERE type ='SUV')),
//         ('Toyota RAV4', (SELECT id FROM body WHERE type ='SUV')),
//         ('Toyota Highlander', (SELECT id FROM body WHERE type ='SUV')),
//         ('Toyota Grand Highlander', (SELECT id FROM body WHERE type ='SUV')),
//         ('Toyota 4Runner', (SELECT id FROM body WHERE type ='SUV')),
//         ('Toyota Land Cruiser', (SELECT id FROM body WHERE type ='SUV')),
//         ('Toyota Tacoma', (SELECT id FROM body WHERE type ='Truck')),
//         ('Toyota Tundra', (SELECT id FROM body WHERE type ='Truck')),
//         ('Volkswagen Jetta', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Volkswagen Passat', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Volkswagen Phaeton', (SELECT id FROM body WHERE type ='Sedan')),
//         ('Volvo V90', (SELECT id FROM body WHERE type ='Wagon'));
//     `;

//     // Run the SQL query
//     await client.query(SQL);
//     console.log("We have seeded our db");

//     // Close the connection
//     await client.end();
//   } catch (error) {
//     console.error("Error seeding the database:", error);
//   }
// };

// seed();

// const { client } = require("./common");

// const seed = async () => {
//   try {
//     await client.connect();

//     const SQL = `
//      DROP TABLE IF EXISTS body;
//         CREATE TABLE body(
//             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//             type VARCHAR(100)
//         );
//         INSERT INTO body(type) VALUES('SUV');
//         INSERT INTO body(type) VALUES('Sedan');
//         INSERT INTO body(type) VALUES('Convertible');
//         INSERT INTO body(type) VALUES('Coupe');
//         INSERT INTO body(type) VALUES('Minivan');
//         INSERT INTO body(type) VALUES('Wagon');
//     DROP TABLE IF EXISTS cars CASCADE;
//       CREATE TABLE cars(
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         name VARCHAR(100)
//         body_id UUID REFERENCES body(id) NOT NULL
//         );

//         INSERT INTO cars(name, body_id) VALUES('Acura MDX', (SELECT id from body where type ='SUV'));
//         INSERT INTO cars(name, body_id) VALUES('Audi Q5', (SELECT id from body where type ='SUV'));
//         INSERT INTO cars(name, body_id) VALUES('BMW X3', (SELECT id from body where type ='SUV'));
//         INSERT INTO cars(name, body_id) VALUES('Buick Enclave', (SELECT id from body where type ='SUV'));
//         INSERT INTO cars(name, body_id) VALUES('Cadillac Escalade', (SELECT id from body where type ='SUV'));
//         INSERT INTO cars(name, body_id) VALUES('Chevrolet Equinox', (SELECT id from body where type ='SUV'));
//         INSERT INTO cars(name, body_id) VALUES('Chrysler Pacifica', (SELECT id from body where type ='Minivan'));
//         INSERT INTO cars(name, body_id) VALUES('Dodge Hornet', (SELECT id from body where type ='SUV'));
//         INSERT INTO cars(name, body_id) VALUES('Ford Mustang', (SELECT id from body where type ='Coupe'));
//         INSERT INTO cars(name, body_id) VALUES('GMC Yukon', (SELECT id from body where type ='SUV'));
//         INSERT INTO cars(name, body_id) VALUES('Honda Civic', (SELECT id from body where type ='Sedan'));
//         INSERT INTO cars(name, body_id) VALUES('Hyundai Sonata', (SELECT id from body where type ='Sedan'));
//         INSERT INTO cars(name, body_id) VALUES('Jeep Cherokee', (SELECT id from body where type ='SUV'));
//         INSERT INTO cars(name, body_id) VALUES('KIA Optima', (SELECT id from body where type ='Sedan'));
//         INSERT INTO cars(name, body_id) VALUES('Lexus ES350', (SELECT id from body where type ='Sedan'));
//         INSERT INTO cars(name, body_id) VALUES('Lincoln Navigator', (SELECT id from body where type ='SUV'));
//         INSERT INTO cars(name, body_id) VALUES('Mazda Miata', (SELECT id from body where type ='Convertible'));
//         INSERT INTO cars(name, body_id) VALUES('Mercedes-Benz S600', (SELECT id from body where type ='Sedan'));
//         INSERT INTO cars(name, body_id) VALUES('Nissan Altima', (SELECT id from body where type ='Sedan'));
//         INSERT INTO cars(name, body_id) VALUES('Toyota Camry', (SELECT id from body where type ='Sedan'));
//         INSERT INTO cars(name, body_id) VALUES('Volkswagen Jetta', (SELECT id from body where type ='Sedan'));
//         INSERT INTO cars(name, body_id) VALUES('Volvo V90', (SELECT id from body where type ='Wagon'));

//         `;
//     await client.query(SQL);
//     console.log("We have seeded our db");
//     await client.end();
//   } catch (error) {
//     console.error(error);
//   }
// };

// seed();

// DROP TABLE IF EXISTS genre CASCADE;
// DROP TABLE IF EXISTS movies CASCADE;
// DROP TABLE IF EXISTS movies_genre;
//   CREATE TABLE genre(
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   type VARCHAR(100)
// );
//   CREATE TABLE movies(
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   name VARCHAR(100)
// );
//  CREATE TABLE movies_genre(
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   genre_id UUID REFERENCES genre(id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
//   movie_id UUID REFERENCES movies(id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL
// );

// INSERT INTO genre(type) VALUES('comedy');
// INSERT INTO genre(type) VALUES('action');
// INSERT INTO genre(type) VALUES('horror');
// INSERT INTO genre(type) VALUES('romance');

// INSERT INTO movies(name) VALUES('The Bounty Hunter');
// INSERT INTO movies(name) VALUES('Zombieland');
// INSERT INTO movies_genre(genre_id, movie_id)
// VALUES((SELECT id from genre where type ='comedy'),
//  (SELECT id from movies where name ='The Bounty Hunter'));
//  INSERT INTO movies_genre(genre_id, movie_id)
// VALUES((SELECT id from genre where type ='action'),
//  (SELECT id from movies where name ='The Bounty Hunter'));
//  INSERT INTO movies_genre(genre_id, movie_id)
// VALUES((SELECT id from genre where type ='romance'),
//  (SELECT id from movies where name ='The Bounty Hunter'));
//         INSERT INTO movies_genre(genre_id, movie_id)
// VALUES((SELECT id from genre where type ='horror'),
//  (SELECT id from movies where name ='Zombieland'));
//   INSERT INTO movies_genre(genre_id, movie_id)
// VALUES((SELECT id from genre where type ='comedy'),
//  (SELECT id from movies where name ='Zombieland'));
//         INSERT INTO movies_genre(genre_id, movie_id)
// VALUES((SELECT id from genre where type ='action'),
//  (SELECT id from movies where name ='Zombieland'));
