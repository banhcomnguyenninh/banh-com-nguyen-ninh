// ========================================
// 1. KẾT NỐI SUPABASE
// ========================================

const SUPABASE_URL_SAN_PHAM =
    "https://nfdovcuvgdmdhynhuhxy.supabase.co";

const SUPABASE_KEY_SAN_PHAM =
    "sb_publishable_g4fa73qmE0k9nd9TUNTlpg_88X1DgfV";

const supabaseSanPham =
    window.supabase.createClient(
        SUPABASE_URL_SAN_PHAM,
        SUPABASE_KEY_SAN_PHAM
    );


// ========================================
// 2. LÀM SẠCH NỘI DUNG
// ========================================

function lamSachNoiDung(noiDung) {
    const oTam =
        document.createElement("div");

    oTam.textContent =
        String(noiDung ?? "");

    return oTam.innerHTML;
}


// ========================================
// 3. ĐỊNH DẠNG TIỀN
// ========================================

function dinhDangGiaSanPham(gia) {
    return Number(gia)
        .toLocaleString("vi-VN");
}


// ========================================
// 4. LẤY QUY CÁCH SẢN PHẨM
// ========================================

function layQuyCachSanPham(sanPham) {
    // Sản phẩm mới sử dụng cột quy_cach
    if (
        sanPham.quy_cach &&
        String(sanPham.quy_cach).trim()
    ) {
        return String(
            sanPham.quy_cach
        ).trim();
    }

    // Sản phẩm cũ sử dụng cột so_banh
    if (sanPham.so_banh) {
        return (
            sanPham.so_banh +
            " bánh"
        );
    }

    return "1 phần";
}

function boDauTiengViet(noiDung) {
    return String(noiDung || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function layDanhMucSanPham(tenSanPham) {
    const ten = boDauTiengViet(tenSanPham);

    if (ten.includes("mochi")) return "mochi";
    if (ten.includes("xu xe") || ten.includes("phu the")) return "xu-xe";
    if (ten.includes("o mai") || ten.includes("omai") || ten.includes("mut")) return "o-mai";
    if (ten.includes("banh com")) return "banh-com";
    if (ten.includes("com tuoi") || ten.includes("com kho") || ten.includes("com rang")) return "com";
    return "khac";
}


// ========================================
// 5. HIỂN THỊ THÔNG BÁO
// ========================================

function hienThongBaoSanPham(
    luoiSanPham,
    noiDung,
    mauChu
) {
    const thongBao =
        document.createElement("p");

    thongBao.className =
        "thong-bao-tai-san-pham";

    thongBao.textContent =
        noiDung;

    thongBao.style.color =
        mauChu;

    thongBao.style.gridColumn =
        "1 / -1";

    thongBao.style.textAlign =
        "center";

    luoiSanPham.appendChild(
        thongBao
    );
}


// ========================================
// 6. TẠO THẺ SẢN PHẨM
// ========================================

function taoTheSanPham(sanPham) {
    const theSanPham =
        document.createElement(
            "article"
        );

    theSanPham.className =
        "the-san-pham san-pham-tu-admin";

    if (sanPham.noi_bat === true) {
        theSanPham.classList.add("san-pham-hot");
    }

    const idSoLuong =
        "so-luong-admin-" +
        sanPham.id;

    const idThanhTien =
        "tien-admin-" +
        sanPham.id;

    const quyCach =
        layQuyCachSanPham(
            sanPham
        );

    const tenTrongGio =
        sanPham.ten +
        " - " +
        quyCach;

    const gia =
        Number(sanPham.gia);

    theSanPham.dataset.ten = boDauTiengViet(sanPham.ten);
    theSanPham.dataset.gia = String(gia);
    theSanPham.dataset.danhMuc = layDanhMucSanPham(sanPham.ten);
    theSanPham.dataset.thuTu = String(sanPham._thuTuHienThi || 0);

    const nhanHot = sanPham.noi_bat === true
        ? '<span class="nhan-hot">HOT</span>'
        : '';

    theSanPham.innerHTML = `
        ${nhanHot}
        <img
            class="anh-san-pham"
            src="${lamSachNoiDung(
                sanPham.anh_url
            )}"
            alt="${lamSachNoiDung(
                sanPham.ten
            )}"
            loading="lazy"
        >

        <div class="noi-dung-san-pham">

            <h3>
                ${lamSachNoiDung(
                    sanPham.ten
                )}
            </h3>

            <p>
                ${lamSachNoiDung(
                    sanPham.mo_ta
                )}
            </p>

            <p class="gia-san-pham">
                ${dinhDangGiaSanPham(
                    gia
                )}
                đồng/
                ${lamSachNoiDung(
                    quyCach
                )}
            </p>

            <div class="khung-gia">

                <div class="hang-so-luong">

                    <label for="${idSoLuong}">
                        Số phần:
                    </label>

                    <input
                        class="o-so-luong"
                        id="${idSoLuong}"
                        type="number"
                        min="1"
                        value="1"
                        inputmode="numeric"
                        data-gia="${gia}"
                        data-ketqua="${idThanhTien}"
                    >

                </div>

                <p class="thanh-tien">
                    Thành tiền:

                    <span id="${idThanhTien}">
                        ${dinhDangGiaSanPham(
                            gia
                        )}
                        đồng
                    </span>
                </p>

                <button
                    type="button"
                    class="nut nut-them-gio"
                    data-ten="${lamSachNoiDung(
                        tenTrongGio
                    )}"
                    data-gia="${gia}"
                    data-input="${idSoLuong}"
                >
                    🛒 Thêm vào giỏ
                </button>

            </div>

        </div>
    `;

    return theSanPham;
}


// ========================================
// 7. TẢI SẢN PHẨM TỪ SUPABASE
// ========================================

async function taiSanPhamTuSupabase() {
    const luoiSanPham =
        document.querySelector(
            ".luoi-san-pham"
        );

    if (!luoiSanPham) {
        return;
    }

    // Xóa thông báo lỗi cũ nếu có
    luoiSanPham
        .querySelectorAll(
            ".thong-bao-tai-san-pham"
        )
        .forEach(function (thongBao) {
            thongBao.remove();
        });

    // Xóa sản phẩm Supabase cũ để tránh bị lặp
    luoiSanPham
        .querySelectorAll(
            ".san-pham-tu-admin"
        )
        .forEach(function (sanPham) {
            sanPham.remove();
        });

    hienThongBaoSanPham(
        luoiSanPham,
        "Đang tải sản phẩm...",
        "#555555"
    );
const { data, error } = await supabaseSanPham    .from("san_pham")
    .select("*")
    .eq("dang_ban", true);

    // Xóa chữ đang tải
    luoiSanPham
        .querySelectorAll(
            ".thong-bao-tai-san-pham"
        )
        .forEach(function (thongBao) {
            thongBao.remove();
        });

    if (error) {
        hienThongBaoSanPham(
            luoiSanPham,
            "Không tải được sản phẩm: " +
                error.message,
            "#c0392b"
        );

        return;
    }

    if (!data || data.length === 0) {
        hienThongBaoSanPham(
            luoiSanPham,
            "Hiện chưa có sản phẩm mới.",
            "#666666"
        );

        document.dispatchEvent(
            new CustomEvent(
                "sanPhamDaTai"
            )
        );

        return;
    }
// Sắp xếp sản phẩm Hot lên đầu
data.sort(function (sanPhamA, sanPhamB) {
    const hotA = sanPhamA.noi_bat === true;
    const hotB = sanPhamB.noi_bat === true;

    // Sản phẩm Hot đứng trước sản phẩm thường
    if (hotA !== hotB) {
        return hotA ? -1 : 1;
    }

    // Nếu cả hai đều Hot, xếp theo số 1, 2, 3...
    if (hotA && hotB) {
        const thuTuA =
            Number(sanPhamA.thu_tu_hot) || 999;

        const thuTuB =
            Number(sanPhamB.thu_tu_hot) || 999;

        return thuTuA - thuTuB;
    }

    // Các sản phẩm thường giữ thứ tự hiện tại
    return 0;
});
    data.forEach(function (sanPham, viTri) {
        sanPham._thuTuHienThi = viTri;
        const theSanPham =
            taoTheSanPham(
                sanPham
            );

        luoiSanPham.appendChild(
            theSanPham
        );
    });

    // Báo cho script.js kết nối:
    // tính tiền, tăng giảm, thêm giỏ và phóng ảnh
    document.dispatchEvent(
        new CustomEvent(
            "sanPhamDaTai"
        )
    );

    khoiTaoBoLocSanPham();
}

function khoiTaoBoLocSanPham() {
    const oTim = document.getElementById("tim-san-pham");
    const oSapXep = document.getElementById("sap-xep-san-pham");
    const cacNutDanhMuc = document.querySelectorAll(".nut-danh-muc");
    const luoi = document.querySelector(".luoi-san-pham");

    if (!luoi || !oTim || !oSapXep || luoi.dataset.daLoc === "true") return;
    luoi.dataset.daLoc = "true";
    let danhMucDangChon = "tat-ca";

    function capNhatSanPham() {
        const tuKhoa = boDauTiengViet(oTim.value.trim());
        const cacThe = Array.from(luoi.querySelectorAll(".san-pham-tu-admin"));

        cacThe.sort(function (a, b) {
            const kieu = oSapXep.value;
            if (kieu === "ten-az") return a.dataset.ten.localeCompare(b.dataset.ten, "vi");
            if (kieu === "ten-za") return b.dataset.ten.localeCompare(a.dataset.ten, "vi");
            if (kieu === "gia-tang") return Number(a.dataset.gia) - Number(b.dataset.gia);
            if (kieu === "gia-giam") return Number(b.dataset.gia) - Number(a.dataset.gia);
            return Number(a.dataset.thuTu) - Number(b.dataset.thuTu);
        });

        let soLuongHien = 0;
        cacThe.forEach(function (the) {
            const dungTuKhoa = !tuKhoa || the.dataset.ten.includes(tuKhoa);
            const dungDanhMuc = danhMucDangChon === "tat-ca" || the.dataset.danhMuc === danhMucDangChon;
            const duocHien = dungTuKhoa && dungDanhMuc;
            the.classList.toggle("an", !duocHien);
            luoi.appendChild(the);
            if (duocHien) soLuongHien += 1;
        });

        const thongBao = document.getElementById("khong-co-ket-qua");
        if (thongBao) thongBao.classList.toggle("an", soLuongHien > 0);
    }

    oTim.addEventListener("input", capNhatSanPham);
    oSapXep.addEventListener("change", capNhatSanPham);
    cacNutDanhMuc.forEach(function (nut) {
        nut.addEventListener("click", function () {
            danhMucDangChon = nut.dataset.danhMuc;
            cacNutDanhMuc.forEach(function (nutKhac) { nutKhac.classList.remove("dang-chon"); });
            nut.classList.add("dang-chon");
            capNhatSanPham();
        });
    });
}


// ========================================
// 8. BẮT ĐẦU TẢI SẢN PHẨM
// ========================================

taiSanPhamTuSupabase();
