DELETE FROM metodos_pago;
DELETE FROM solicitudes;
DELETE FROM entradas;

INSERT INTO entradas (id, tipo, nombre, campana, descripcion_es, descripcion_en, verificacion_url, activo, destacado) VALUES
(1, 'persona', 'Luis Alamo, Rosangelica Castro y Angel Gonzalez', 'Grupo Chile: insumos para Venezuela', 'Recolectan insumos medicos y alimentos no perecederos en Chile, y coordinan el envio a Venezuela.', 'They collect medical supplies and non-perishable food in Chile, and coordinate shipment to Venezuela.', 'https://www.instagram.com/', 1, 1),
(2, 'persona', 'Jhatcielys Monsalve Palma', 'Los Teques se solidariza - Hospital Victorino Santaella', 'Todo lo recaudado va a comprar medicinas para el Hospital Victorino Santaella, Los Teques, Estado Miranda.', 'All funds raised go toward medicines for Hospital Victorino Santaella in Los Teques, Miranda State.', 'Flyer Los Teques Se Solidariza', 1, 1),
(3, 'persona', 'Yineldy Serrano', 'Ayuda para ninos de Venezuela', 'Recaudacion para ninos afectados por el terremoto.', 'Fundraising for children affected by the earthquake.', 'https://www.instagram.com/reel/DaDkEnFhxPi/', 1, 0),
(4, 'organizacion', 'UCV Firefighters Foundation', 'Emergency Relief for Venezuela''s Earthquake Survivors', 'Organizacion de bomberos de la UCV. Recibos oficiales disponibles.', 'UCV firefighters organization. Official receipts available.', 'https://donorbox.org/emergency-relief-for-venezuela-s-earthquake-survivors', 1, 1),
(5, 'organizacion', 'Hogar Bambi Venezuela', 'Apoyo integral para ninos afectados', 'ONG venezolana enfocada en ninos. Ayuda a afectados por el terremoto y acepta donaciones internacionales y desde Venezuela.', 'Venezuelan NGO focused on children. It helps people affected by the earthquake and accepts international and Venezuela-based donations.', 'https://hogarbambi.org', 1, 1),
(6, 'organizacion', 'Emergencias SJ', 'Emergencia Venezuela', 'Coordinacion humanitaria de emergencia con informacion actualizada y canalizacion de ayuda para Venezuela.', 'Emergency humanitarian coordination with updated information and aid channels for Venezuela.', 'https://emergencias-sj.org/emergencia-venezuela/', 1, 0);

INSERT INTO metodos_pago (entrada_id, tipo, pais, detalle, moneda) VALUES
(1, 'banco_cl', 'CL', 'Banco Estado CuentaRUT 27350888 - Rosangelica Castro Aular - RUT 27.350.888-0', 'CLP'),
(1, 'whatsapp', 'CL', 'WhatsApp Luis Alamo +56 9 5152 1278', NULL),
(1, 'whatsapp', 'CL', 'WhatsApp Rosangelica +56 9 2634 3631', NULL),
(1, 'whatsapp', 'CL', 'WhatsApp Angel Gonzalez +56 9 9911 2024', NULL),
(2, 'banco_ve', 'VE', 'Banco Mercantil VE cuenta 01050650661650100647', 'VES'),
(2, 'pago_movil', 'VE', 'Pago movil 04142043433', 'VES'),
(2, 'banco_cl', 'CL', 'Banco Estado CL CuentaRUT 26723304-7 - Jhatcielys Hernandez Palma', 'CLP'),
(3, 'paypal', NULL, 'PayPal Yineldyserrano', 'USD'),
(3, 'zelle', 'US', 'Zelle Yineldysg89@gmail.com', 'USD'),
(3, 'pago_movil', 'VE', 'Pago movil 0102 / 0412 0570930 / 22.033.336', 'VES'),
(4, 'donorbox', NULL, 'https://donorbox.org/emergency-relief-for-venezuela-s-earthquake-survivors', 'USD'),
(5, 'banco_us', 'US', 'Bank of America - Bambi International Foundation - cuenta 898166366573 - ACH/Routing 063100277 - 7441 SW 134th St, Pinecrest FL 33156', 'USD'),
(5, 'zelle', 'US', 'admin@bambifoundation.org', 'USD'),
(5, 'venmo', 'US', '@Bambi-InternationalFoundation', 'USD'),
(5, 'banco_ve', 'VE', 'Banesco - Asociacion Civil Hogar Bambi Venezuela - RIF J-302517079 - cuenta corriente 0134 0277 9927 7101 5290', 'VES'),
(5, 'globalgiving', NULL, 'https://www.globalgiving.org/projects/integral-support-program-for-children/', 'USD'),
(6, 'otro', NULL, 'Ver sitio oficial: https://emergencias-sj.org/emergencia-venezuela/', NULL);
