DELETE FROM metodos_contacto;
DELETE FROM metodos_pago;
DELETE FROM solicitudes;
DELETE FROM entradas;

INSERT INTO entradas (id, tipo, nombre, campana, descripcion_es, descripcion_en, verificacion_url, activo, destacado) VALUES
(1, 'persona', 'Luis Alamo, Rosangelica Castro y Angel Gonzalez', 'Grupo Chile: insumos para Venezuela', 'Recolectan insumos médicos y alimentos no perecederos en Chile, y coordinan el envío a Venezuela.', 'They collect medical supplies and non-perishable food in Chile, and coordinate shipment to Venezuela.', 'https://www.instagram.com/', 1, 1),
(2, 'persona', 'Jhatcielys Monsalve Palma', 'Los Teques se solidariza - Hospital Victorino Santaella', 'Todo lo recaudado va a comprar medicinas para el Hospital Victorino Santaella, Los Teques, Estado Miranda.', 'All funds raised go toward medicines for Hospital Victorino Santaella in Los Teques, Miranda State.', 'https://www.instagram.com/jhatcielysjvhp/', 1, 1),
(3, 'persona', 'Yineldy Serrano', 'Ayuda para niños de Venezuela', 'Recaudación para niños afectados por el terremoto.', 'Fundraising for children affected by the earthquake.', 'https://www.instagram.com/reel/DaD87YgpLlY/', 1, 0),
(4, 'organizacion', 'UCV Firefighters Foundation', 'Emergency Relief for Venezuela''s Earthquake Survivors', 'Organización de bomberos de la UCV. Recibos oficiales disponibles.', 'UCV firefighters organization. Official receipts available.', 'https://donorbox.org/emergency-relief-for-venezuela-s-earthquake-survivors', 1, 1),
(5, 'organizacion', 'Hogar Bambi Venezuela', 'Apoyo integral para niños afectados', 'ONG venezolana enfocada en niños. Ayuda a afectados por el terremoto y acepta donaciones internacionales y desde Venezuela.', 'Venezuelan NGO focused on children. It helps people affected by the earthquake and accepts international and Venezuela-based donations.', 'https://hogarbambi.org', 1, 1),
(6, 'organizacion', 'Emergencias SJ', 'Emergencia Venezuela', 'Coordinación humanitaria de emergencia con información actualizada y canalización de ayuda para Venezuela.', 'Emergency humanitarian coordination with updated information and aid channels for Venezuela.', 'https://emergencias-sj.org/emergencia-venezuela/', 1, 0);

INSERT INTO metodos_pago (entrada_id, tipo, pais, detalle, moneda) VALUES
(1, 'banco_cl', 'CL', 'Banco Estado CuentaRUT 27350888 - Rosangelica Castro Aular - RUT 27.350.888-0', 'CLP'),
(2, 'banco_ve', 'VE', 'Banco Mercantil VE cuenta 01050650661650100647', 'VES'),
(2, 'pago_movil', 'VE', 'Pago móvil 04142043433', 'VES'),
(2, 'banco_cl', 'CL', 'Banco Estado CL CuentaRUT 26723304-7 - Jhatcielys Hernandez Palma', 'CLP'),
(3, 'paypal', NULL, 'PayPal Yineldyserrano', 'USD'),
(3, 'zelle', 'US', 'Zelle Yineldysg89@gmail.com', 'USD'),
(3, 'pago_movil', 'VE', 'Pago móvil 0102 / 0412 0570930 / 22.033.336', 'VES'),
(4, 'donorbox', NULL, 'https://donorbox.org/emergency-relief-for-venezuela-s-earthquake-survivors', 'USD'),
(5, 'banco_us', 'US', 'Bank of America - Bambi International Foundation - cuenta 898166366573 - ACH/Routing 063100277 - 7441 SW 134th St, Pinecrest FL 33156', 'USD'),
(5, 'zelle', 'US', 'admin@bambifoundation.org', 'USD'),
(5, 'venmo', 'US', '@Bambi-InternationalFoundation', 'USD'),
(5, 'banco_ve', 'VE', 'Banesco - Asociación Civil Hogar Bambi Venezuela - RIF J-302517079 - cuenta corriente 0134 0277 9927 7101 5290', 'VES'),
(5, 'globalgiving', NULL, 'https://www.globalgiving.org/projects/integral-support-program-for-children/', 'USD'),
(6, 'otro', NULL, 'Ver sitio oficial: https://emergencias-sj.org/emergencia-venezuela/', NULL);

INSERT INTO metodos_contacto (entrada_id, tipo, label, detalle) VALUES
(1, 'whatsapp', 'Luis Alamo', '+56 9 5152 1278'),
(1, 'whatsapp', 'Rosangelica', '+56 9 2634 3631'),
(1, 'whatsapp', 'Angel Gonzalez', '+56 9 9911 2024'),
(2, 'instagram', NULL, 'https://www.instagram.com/jhatcielysjvhp/'),
(4, 'instagram', NULL, 'https://www.instagram.com/givepandevida/'),
(5, 'instagram', NULL, 'https://www.instagram.com/hogarbambi/'),
(6, 'web', NULL, 'https://emergencias-sj.org/emergencia-venezuela/');
