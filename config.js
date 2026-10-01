// =========================================================================
// HƯỚNG DẪN THAY CẤU HÌNH & HÌNH ẢNH:
// 1. Nếu dùng ảnh trong máy: Tạo thư mục "images" nằm cùng chỗ với file index.html
//    Copy ảnh vào thư mục đó và sửa tên đường dẫn bên dưới thành: "images/ten-file.jpg"
// 2. Nếu dùng link ảnh trên mạng: Dán trực tiếp link "https://..." vào mục image.
// =========================================================================

// 1. THÔNG TIN CỬA HÀNG & SLIDER BANNER
const SITE_CONFIG = {
  storeName: "Bánh Cốm Nguyên Ninh",
  subTitle: "Dốc Hàng Than - Hà Nội",
  tagline: "Gia truyền từ năm 1865 - Chuẩn vị cốm Hà Thành",
  hotline: "0985868317",
  address: "Số 11 Hàng Than, Ba Đình, Hà Nội",
  email: "banhcomnguyenninh@gmail.com",
  workingHours: "07:30 - 21:30 (Hàng ngày)",
  
  socials: {
    facebook: "https://facebook.com",
    zalo: "https://zalo.me/0985868317"
  },

  // THAY BANNER TRÊN CÙNG TẠI ĐÂY (Khuyên dùng ảnh kích thước 1200x500 px)
  heroBanners: [
    {
      id: 1,
      image: "images/banner.jpg", // Tương đương: thư mục images/banner-1.jpg
      title: "Bánh Cốm Gia Truyền 11 Hàng Than",
      subtitle: "Giữ trọn hương vị truyền thống Hà Nội từ năm 1865"
    },
    {
      id: 2,
      image: "images/11.jpg", // Tương đương: thư mục images/banner-2.jpg
      title: "Cốm Tươi & chả cốm",
      subtitle: "Sản xuất mới mỗi ngày - Phục vụ tráp cưới hỏi trọn gói"
    }
  ],

  // CẤU HÌNH PHÍ GIAO HÀNG
  shipping: {
    innerCityFee: 25000,
    freeShipThreshold: 500000 // Miễn phí giao hàng cho đơn từ 500.000đ trở lên
  }
};

// 2. DANH MỤC SẢN PHẨM
const CATEGORIES = [
  { id: "all", name: "Tất cả sản phẩm" },
  { id: "banh-com", name: "Bánh Cốm" },
  { id: "banh-cuoi", name: "Bánh Cưới Hỏi(phu thê)" },
  { id: "com-tuoi", name: "Cốm Tươi & chả cốm" },
  { id: "mut-tra", name: "Trà & Mứt Sen" },
  { id: "qua-bieu", name: "Set Quà Biếu" }
];

// 3. DANH SÁCH CHI TIẾT 12 SẢN PHẨM (Khuyên dùng ảnh vuông 600x600 px)
const PRODUCTS = [
  {
    id: 1,
    name: "Bánh Cốm Nguyên Ninh (Hộp 1 chiếc)",
    category: "banh-com",
    categoryName: "Bánh Cốm",
    price: 7000,
    priceFormatted: "7.000đ",
    unit: "Chiếc",
    image: "images/banh-com.jpg", // Thay tên file ảnh của bạn vào đây
    description: "Bánh cốm truyền thống Dốc Hàng Than. Vỏ cốm mộc dẻo quánh, nhân đậu xanh dừa nạo ngọt thanh.",
    isFeatured: true,
    inStock: true
  },
  {
    id: 2,
    name: "Bánh Cốm Nguyên Ninh (Hộp 10 chiếc)",
    category: "banh-com",
    categoryName: "Bánh Cốm",
    price: 70000,
    priceFormatted: "70.000đ",
    unit: "Hộp 10 chiếc",
    image: "images/banh-com-10.jpg",
    description: "Hộp 10 chiếc bánh cốm tươi làm mới trong ngày. Thích hợp mua thưởng thức hoặc làm quà biếu nhẹ nhàng.",
    isFeatured: true,
    inStock: true
  },
  {
    id: 3,
    name: "Bánh Phu Thê (Xu Xê) Gia Truyền",
    category: "banh-cuoi",
    categoryName: "Bánh Cưới Hỏi",
    price: 7000,
    priceFormatted: "7.000đ",
    unit: "Chiếc",
    image: "images/banh-phu-the.jpg",
    description: "Bánh phu thê màu đỏ tượng trưng cho sự may mắn, vỏ giòn sần sật, nhân đậu xanh dừa ngọt ngào.",
    isFeatured: false,
    inStock: true
  },
  {
    id: 4,
    name: "Bánh Cốm Đặc Biệt (Hộp Sang Trọng)",
    category: "qua-bieu",
    categoryName: "Set Quà Biếu",
    price: 100000,
    priceFormatted: "100.000đ",
    unit: "Hộp 10 bánh",
    image: "images/banh-com-hop-sang.jpg",
    description: "Bao bì đỏ ép kim vàng sang trọng, gồm 10 chiếc bánh cốm chọn lọc loại 1. Món quà biếu đối tác đậm nét Hà Nội.",
    isFeatured: true,
    inStock: true
  },
  {
    id: 5,
    name: "Cốm Xào Hà Nội (Đĩa 200g)",
    category: "com-tuoi",
    categoryName: "Cốm Tươi & Xào",
    price: 35000,
    priceFormatted: "35.000đ",
    unit: "Đĩa 200g",
    image: "images/com-xao.jpg",
    description: "Cốm mộc được xào tỉ mỉ với nước dừa và đường kính, dẻo quánh, vị ngọt ngậy quyến rũ.",
    isFeatured: false,
    inStock: true
  },
  {
    id: 6,
    name: "Cốm Tươi Mùa Thu (Gói Lá Sen 200g)",
    category: "com-tuoi",
    categoryName: "Cốm Tươi & Xào",
    price: 50000,
    priceFormatted: "50.000đ",
    unit: "Gói 200g",
    image: "images/com-tuoi.jpg",
    description: "Cốm mộc Làng Vòng chuẩn dẻo, thơm hương lúa mới, bọc trong lá sen giữ trọn nét tinh tế.",
    isFeatured: true,
    inStock: true
  },
  {
    id: 7,
    name: "Mứt Sen Trần Hàng Đường (Hũ 300g)",
    category: "mut-tra",
    categoryName: "Trà & Mứt Sen",
    price: 85000,
    priceFormatted: "85.000đ",
    unit: "Hũ 300g",
    image: "images/mut-sen.jpg",
    description: "Hạt sen trần bở tơi, ngọt nhẹ vừa phải, dùng nhâm nhi cùng tách trà nóng vào ngày thu.",
    isFeatured: false,
    inStock: true
  },
  {
    id: 8,
    name: "Trà Thái Nguyên Tôm Nõn Cao Cấp",
    category: "mut-tra",
    categoryName: "Trà & Mứt Sen",
    price: 120000,
    priceFormatted: "120.000đ",
    unit: "Gói 200g",
    image: "images/tra-thai-nguyen.jpg",
    description: "Trà tân cương chọn lọc, nước chát dịu hậu ngọt sâu. Sự kết hợp hoàn hảo khi thưởng thức cùng bánh cốm.",
    isFeatured: false,
    inStock: true
  },
  {
    id: 9,
    name: "Tháp Bánh Cốm Ăn Hỏi (50 bánh)",
    category: "banh-cuoi",
    categoryName: "Bánh Cưới Hỏi",
    price: 380000,
    priceFormatted: "380.000đ",
    unit: "Tháp 50 bánh",
    image: "images/thap-banh-com.jpg",
    description: "Xếp tháp nghệ thuật cao 5-7 tầng, thắt nơ may mắn, chuẩn bị chuyên nghiệp cho các mâm tráp cưới hỏi.",
    isFeatured: true,
    inStock: true
  },
  {
    id: 10,
    name: "Tháp Bánh Phu Thê Ăn Hỏi (50 bánh)",
    category: "banh-cuoi",
    categoryName: "Bánh Cưới Hỏi",
    price: 380000,
    priceFormatted: "380.000đ",
    unit: "Tháp 50 bánh",
    image: "images/thap-banh-phu-the.jpg",
    description: "Tháp bánh xu xê vuông vắn kết duyên, mang thông điệp trăm năm hạnh phúc cho ngày trọng đại.",
    isFeatured: false,
    inStock: true
  },
  {
    id: 11,
    name: "Set Quà Mùa Thu Hà Nội (Đặc Sản)",
    category: "qua-bieu",
    categoryName: "Set Quà Biếu",
    price: 250000,
    priceFormatted: "250.000đ",
    unit: "Set đầy đủ",
    image: "images/set-qua-bieu.jpg",
    description: "Gồm: 10 bánh cốm tươi + 1 hũ mứt sen trần + 1 gói trà Thái Nguyên 100g, đính kèm hộp quà thiết kế tinh tế.",
    isFeatured: true,
    inStock: true
  },
  {
    id: 12,
    name: "Bánh Dẻo Nhân Cốm Đậu Xanh",
    category: "banh-com",
    categoryName: "Bánh Cốm",
    price: 30000,
    priceFormatted: "30.000đ",
    unit: "Chiếc 150g",
    image: "images/banh-deo-com.jpg",
    description: "Vỏ bánh dẻo mịn thơm hương hoa hòe, bao bọc nhân cốm xào đậu xanh dẻo mịn thơm lừng.",
    isFeatured: false,
    inStock: true
  }
];

// 4. XUẤT BIẾN RA HỆ THỐNG
if (typeof window !== 'undefined') {
  window.SITE_CONFIG = SITE_CONFIG;
  window.CATEGORIES = CATEGORIES;
  window.PRODUCTS = PRODUCTS;
  window.products = PRODUCTS;
}