INSERT INTO users (username, email, password_hash)
VALUES 
('Ben', 'ben@test.com', 'benword'),
('Lucas', 'lucas@test.com', 'lucasword')
ON CONFLICT (username) DO NOTHING;

--admin/test user

INSERT INTO users (username, email, password_hash)
VALUES
('admin', 'admin@test.com', '$2a$10$IJq59vOq6ZmMKzFhRHdBduPRuKG8zUov05Pkx37M9zAN.Pr1ZMmKy')
ON CONFLICT (username) DO NOTHING;

INSERT INTO amenity_types (name)
VALUES 
('Wifi'),
('Showers'),
('Parking'),
('Restrooms')
ON CONFLICT (name) DO NOTHING;

INSERT INTO locations (name, address, lat, lng, added_by, image_url)
VALUES 
('Trident Booksellers and Cafe', '940 Pearl St, Boulder, CO', '40.01715712896069', '-105.28299152353834', 1, '/img/tridentimage.jpg'),
('Pearl Street Mall Public Restrooms', '1303 Pearl St, Boulder, CO', '40.01833028573334', '-105.2786974375998', 1, 'img/pearlstreetrestroomimage.jpg'),
('North Boulder Recreation Center', '3170 Broadway, Boulder, CO', '40.03237344852037', '-105.28046955035043', 2, 'img/northboulderrecreationimage.jpg');

INSERT INTO location_amenities (location_id, amenity_type_id, notes)
VALUES
(1,1,'Free wifi'),
(2,4,'Public Restrooms 8am-6pm'),
(3,2,'Showers for a payment');

INSERT INTO reviews (location_id, user_id, rating, body)
VALUES
(1,2,4, 'Good but a bit performative'),
(2,2,4, 'Convenient but not clean'),
(3,1,4, 'Great facilities but it was busy');

