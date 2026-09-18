-- Activate the existing category rows and add the marketplace categories used by the app.
-- This changes data only; it does not create tables, columns, or policies.
insert into public.categories (name, slug, sort_order, icon, is_active) values
  ('العقارات','real-estate',1,'🏠',true),
  ('المركبات والآليات','vehicles-machinery',2,'🚗',true),
  ('الفلاحة والتمور','agriculture-dates',3,'🌴',true),
  ('الإلكترونيات','electronics',4,'📱',true),
  ('المنزل والحديقة','home-garden',5,'🛋️',true),
  ('الخدمات والحرف','services-crafts',6,'🛠️',true),
  ('الملابس والأزياء','clothing-fashion',7,'👕',true),
  ('الصحة والجمال','health-beauty',8,'💄',true),
  ('الأطفال والألعاب','kids-toys',9,'🧸',true),
  ('الرياضة والترفيه','sports-leisure',10,'⚽',true),
  ('الأغذية والمواد الاستهلاكية','food-consumables',11,'🛒',true),
  ('الأدوات والمعدات','tools-equipment',12,'🔧',true),
  ('العمل والتوظيف','jobs-employment',13,'💼',true),
  ('التجارة والمشاريع','business-projects',14,'🏪',true),
  ('أخرى','other',15,'📦',true)
on conflict (slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  icon = excluded.icon,
  is_active = true;
