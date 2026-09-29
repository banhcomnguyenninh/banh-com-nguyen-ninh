// ========================================
// 1. KẾT NỐI SUPABASE
// ========================================

const SUPABASE_URL =
    "https://nfdovcuvgdmdhynhuhxy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_g4fa73qmE0k9nd9TUNTlpg_88X1DgfV";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ========================================
// 2. LẤY CÁC PHẦN TỬ HTML
// ========================================

const khuVucDangNhap =
    document.getElementById("khu-vuc-dang-nhap");

const khuVucQuanLy =
    document.getElementById("khu-vuc-quan-ly");

const formDangNhap =
    document.getElementById("form-dang-nhap");

const thongBaoDangNhap =
    document.getElementById("thong-bao-dang-nhap");

const nutDangXuat =
    document.getElementById("nut-dang-xuat");

const formSanPham =
    document.getElementById("form-san-pham");

const nutLuuSanPham =
    document.getElementById("nut-luu-san-pham");

const nutHuySua =
    document.getElementById("nut-huy-sua");

const thongBaoSanPham =
    document.getElementById("thong-bao-san-pham");

const oChonAnh =
    document.getElementById("anh-san-pham");

const anhXemTruoc =
    document.getElementById("anh-xem-truoc");

const oChonAnhPhu =
    document.getElementById("anh-phu-san-pham");

const danhSachAnhPhuXemTruoc =
    document.getElementById("danh-sach-anh-phu-xem-truoc");

const danhSachQuanLy =
    document.getElementById("danh-sach-quan-ly");

const oTimSanPham =
    document.getElementById("tim-san-pham");

const oLocTrangThai =
    document.getElementById("loc-trang-thai");

const oTongSanPham =
    document.getElementById("tong-san-pham");

const oSanPhamDangBan =
    document.getElementById("san-pham-dang-ban");

const oSanPhamDangAn =
    document.getElementById("san-pham-dang-an");


// ========================================
// 3. HIỆN TRANG ĐĂNG NHẬP/QUẢN LÝ
// ========================================

function hienTrangQuanLy() {
    khuVucDangNhap.classList.add("an");
    khuVucQuanLy.classList.remove("an");

    taiDanhSachSanPham();
}

function hienTrangDangNhap() {
    khuVucQuanLy.classList.add("an");
    khuVucDangNhap.classList.remove("an");
}


// ========================================
// 4. ĐĂNG NHẬP
// ========================================

formDangNhap.addEventListener(
    "submit",
    async function (suKien) {
        suKien.preventDefault();

        const email = document
            .getElementById("email-admin")
            .value
            .trim();

        const matKhau = document
            .getElementById("mat-khau-admin")
            .value;

        thongBaoDangNhap.textContent =
            "Đang đăng nhập...";

        thongBaoDangNhap.style.color =
            "#555555";

        const { error } =
            await supabaseClient.auth
                .signInWithPassword({
                    email: email,
                    password: matKhau
                });

        if (error) {
            thongBaoDangNhap.textContent =
                "Đăng nhập không thành công: " +
                dichLoiDangNhap(error.message);

            thongBaoDangNhap.style.color =
                "#c0392b";

            return;
        }

        formDangNhap.reset();
        thongBaoDangNhap.textContent = "";

        hienTrangQuanLy();
    }
);


// ========================================
// 5. DỊCH LỖI ĐĂNG NHẬP
// ========================================

function dichLoiDangNhap(loi) {
    const noiDung =
        String(loi).toLowerCase();

    if (
        noiDung.includes(
            "invalid login credentials"
        )
    ) {
        return "Email hoặc mật khẩu không đúng.";
    }

    if (
        noiDung.includes(
            "email not confirmed"
        )
    ) {
        return "Email chưa được xác nhận.";
    }

    return loi;
}


// ========================================
// 6. ĐĂNG XUẤT
// ========================================

nutDangXuat.addEventListener(
    "click",
    async function () {
        nutDangXuat.disabled = true;
        nutDangXuat.textContent =
            "Đang đăng xuất...";

        const { error } =
            await supabaseClient.auth.signOut();

        nutDangXuat.disabled = false;
        nutDangXuat.textContent =
            "Đăng xuất";

        if (error) {
            alert(
                "Không đăng xuất được: " +
                error.message
            );

            return;
        }

        huyCheDoSua();
        hienTrangDangNhap();
    }
);


// ========================================
// 7. KIỂM TRA ĐĂNG NHẬP
// ========================================

async function kiemTraDangNhap() {
    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error || !data.session) {
        hienTrangDangNhap();
        return;
    }

    hienTrangQuanLy();
}

kiemTraDangNhap();


// ========================================
// 8. XEM TRƯỚC ẢNH
// ========================================

let duongDanAnhTam = null;
let cacDuongDanAnhPhuTam = [];
let anhPhuHienTai = [];

oChonAnh.addEventListener(
    "change",
    function () {
        const tepAnh =
            oChonAnh.files[0];

        const cacTepAnhPhu =
            Array.from(oChonAnhPhu.files || []);

        if (duongDanAnhTam) {
            URL.revokeObjectURL(
                duongDanAnhTam
            );

            duongDanAnhTam = null;
        }

        if (!tepAnh) {
            xoaAnhXemTruoc();
            return;
        }

        if (!tepAnh.type.startsWith("image/")) {
            hienLoiSanPham(
                "Tệp đã chọn không phải là ảnh."
            );

            oChonAnh.value = "";
            return;
        }

        if (tepAnh.size > 5 * 1024 * 1024) {
            hienLoiSanPham(
                "Ảnh phải nhỏ hơn 5 MB."
            );

            oChonAnh.value = "";
            return;
        }

        duongDanAnhTam =
            URL.createObjectURL(tepAnh);

        anhXemTruoc.src =
            duongDanAnhTam;

        anhXemTruoc.classList.remove("an");

        thongBaoSanPham.textContent = "";
    }
);


// ========================================
// 9. THÊM HOẶC SỬA SẢN PHẨM
// ========================================

formSanPham.addEventListener(
    "submit",
    async function (suKien) {
        suKien.preventDefault();

        const idSua =
            formSanPham.dataset.idSua || "";

        const ten = document
            .getElementById("ten-san-pham")
            .value
            .trim();

        const gia = Number(
            document
                .getElementById("gia-san-pham")
                .value
        );

        const quyCach = document
            .getElementById("quy-cach")
            .value
            .trim();

        const moTa = document
            .getElementById("mo-ta-san-pham")
            .value
            .trim();

        const tepAnh =
            oChonAnh.files[0];

        if (!ten) {
            hienLoiSanPham(
                "Vui lòng nhập tên sản phẩm."
            );
            return;
        }

        if (
            !Number.isFinite(gia) ||
            gia <= 0
        ) {
            hienLoiSanPham(
                "Giá sản phẩm phải lớn hơn 0."
            );
            return;
        }

        if (!quyCach) {
            hienLoiSanPham(
                "Vui lòng nhập số lượng hoặc quy cách."
            );
            return;
        }

        if (!idSua && !tepAnh) {
            hienLoiSanPham(
                "Vui lòng chọn ảnh sản phẩm."
            );
            return;
        }

        if (
            tepAnh &&
            !tepAnh.type.startsWith("image/")
        ) {
            hienLoiSanPham(
                "Tệp đã chọn không phải là ảnh."
            );
            return;
        }

        if (
            tepAnh &&
            tepAnh.size > 5 * 1024 * 1024
        ) {
            hienLoiSanPham(
                "Ảnh phải nhỏ hơn 5 MB."
            );
            return;
        }

        if (cacTepAnhPhu.length > 8) {
            hienLoiSanPham("Chỉ được chọn tối đa 8 ảnh quảng cáo.");
            return;
        }

        if (cacTepAnhPhu.some(function (tep) {
            return !tep.type.startsWith("image/") || tep.size > 5 * 1024 * 1024;
        })) {
            hienLoiSanPham("Mỗi ảnh quảng cáo phải là tệp ảnh và nhỏ hơn 5 MB.");
            return;
        }

        batDauLuuSanPham(
            idSua
                ? "Đang cập nhật sản phẩm..."
                : "Đang thêm sản phẩm..."
        );
    const laSanPhamHot = document
    .getElementById("noi-bat-san-pham")
    .checked;

const thuTuHot = Number(
    document
        .getElementById("thu-tu-hot")
        .value
);

const duLieuSanPham = {
    ten: ten,
    gia: gia,
    quy_cach: quyCach,
    mo_ta: moTa,
    so_banh: 1,
    noi_bat: laSanPhamHot,

    thu_tu_hot: laSanPhamHot
        ? thuTuHot || 999
        : null
};

        let duongDanAnhMoi = null;
        let cacDuongDanAnhMoi = [];

        // Tải ảnh mới nếu đã chọn ảnh
        if (tepAnh) {
            const duoiAnh =
                layDuoiAnh(tepAnh);

            const maNgauNhien =
                typeof crypto.randomUUID ===
                "function"
                    ? crypto.randomUUID()
                    : Math.random()
                        .toString(36)
                        .slice(2);

            duongDanAnhMoi =
                "san-pham/" +
                Date.now() +
                "-" +
                maNgauNhien +
                "." +
                duoiAnh;

            const { error: loiTaiAnh } =
                await supabaseClient.storage
                    .from("anh-san-pham")
                    .upload(
                        duongDanAnhMoi,
                        tepAnh,
                        {
                            contentType:
                                tepAnh.type,
                            upsert: false
                        }
                    );

            if (loiTaiAnh) {
                hienLoiSanPham(
                    "Không tải được ảnh: " +
                    loiTaiAnh.message
                );

                ketThucLuuSanPham();
                return;
            }

            const { data: duLieuAnh } =
                supabaseClient.storage
                    .from("anh-san-pham")
                    .getPublicUrl(
                        duongDanAnhMoi
                    );

            duLieuSanPham.anh_url =
                duLieuAnh.publicUrl;
        }

        if (cacTepAnhPhu.length > 0) {
            for (const tepAnhPhu of cacTepAnhPhu) {
                const duoiAnh = layDuoiAnh(tepAnhPhu);
                const maNgauNhien = typeof crypto.randomUUID === "function"
                    ? crypto.randomUUID()
                    : Math.random().toString(36).slice(2);
                const duongDan = "san-pham/anh-phu/" + Date.now() + "-" + maNgauNhien + "." + duoiAnh;
                const { error: loiTaiAnhPhu } = await supabaseClient.storage
                    .from("anh-san-pham")
                    .upload(duongDan, tepAnhPhu, { contentType: tepAnhPhu.type, upsert: false });

                if (loiTaiAnhPhu) {
                    if (cacDuongDanAnhMoi.length) {
                        await supabaseClient.storage.from("anh-san-pham").remove(cacDuongDanAnhMoi.map(function (anh) { return anh.path; }));
                    }
                    hienLoiSanPham("Không tải được ảnh quảng cáo: " + loiTaiAnhPhu.message);
                    ketThucLuuSanPham();
                    return;
                }

                const { data: duLieuAnhPhu } = supabaseClient.storage
                    .from("anh-san-pham")
                    .getPublicUrl(duongDan);
                cacDuongDanAnhMoi.push({ path: duongDan, url: duLieuAnhPhu.publicUrl });
            }
            duLieuSanPham.anh_phu = cacDuongDanAnhMoi.map(function (anh) { return anh.url; });
        } else if (idSua) {
            duLieuSanPham.anh_phu = anhPhuHienTai;
        }

        let loiLuu = null;
        let daSuaDuLieu = true;

        if (idSua) {
            const {
                data: duLieuCapNhat,
                error
            } = await supabaseClient
                .from("san_pham")
                .update(duLieuSanPham)
                .eq("id", idSua)
                .select("id");

            loiLuu = error;

            daSuaDuLieu =
                Array.isArray(duLieuCapNhat) &&
                duLieuCapNhat.length > 0;
        } else {
            const { error } =
                await supabaseClient
                    .from("san_pham")
                    .insert({
                        ...duLieuSanPham,
                        dang_ban: true
                    });

            loiLuu = error;
        }

        if (
            loiLuu ||
            (idSua && !daSuaDuLieu)
        ) {
            if (duongDanAnhMoi) {
                await supabaseClient.storage
                    .from("anh-san-pham")
                    .remove([
                        duongDanAnhMoi
                    ]);
            }

            if (cacDuongDanAnhMoi.length) {
                await supabaseClient.storage
                    .from("anh-san-pham")
                    .remove(cacDuongDanAnhMoi.map(function (anh) { return anh.path; }));
            }

            if (
                idSua &&
                !loiLuu &&
                !daSuaDuLieu
            ) {
                hienLoiSanPham(
                    "Không sửa được sản phẩm. Hãy kiểm tra quyền UPDATE trong Supabase."
                );
            } else {
                hienLoiSanPham(
                    "Không lưu được sản phẩm: " +
                    loiLuu.message
                );
            }

            ketThucLuuSanPham();
            return;
        }

        thongBaoSanPham.textContent =
            idSua
                ? "Đã sửa sản phẩm thành công."
                : "Đã thêm sản phẩm thành công.";

        thongBaoSanPham.style.color =
            "#176b3a";

        formSanPham.reset();

        delete formSanPham.dataset.idSua;

        nutHuySua.classList.add("an");

        xoaAnhXemTruoc();
        xoaAnhPhuXemTruoc();
        ketThucLuuSanPham();

        await taiDanhSachSanPham();
    }
);


// ========================================
// 10. TRẠNG THÁI NÚT LƯU
// ========================================

function batDauLuuSanPham(noiDung) {
    nutLuuSanPham.disabled = true;
    nutLuuSanPham.textContent =
        "Đang xử lý...";

    thongBaoSanPham.textContent =
        noiDung;

    thongBaoSanPham.style.color =
        "#555555";
}

function ketThucLuuSanPham() {
    nutLuuSanPham.disabled = false;
    nutLuuSanPham.textContent =
        "💾 Lưu sản phẩm";
}


// ========================================
// 11. XỬ LÝ ẢNH
// ========================================

function layDuoiAnh(tepAnh) {
    if (tepAnh.type === "image/png") {
        return "png";
    }

    if (tepAnh.type === "image/webp") {
        return "webp";
    }

    return "jpg";
}

function xoaAnhXemTruoc() {
    if (duongDanAnhTam) {
        URL.revokeObjectURL(
            duongDanAnhTam
        );

        duongDanAnhTam = null;
    }

    anhXemTruoc.src = "";
    anhXemTruoc.classList.add("an");
}

function hienAnhPhuXemTruoc(danhSachAnh) {
    const danhSach = Array.isArray(danhSachAnh) ? danhSachAnh.filter(Boolean) : [];
    if (!danhSach.length) {
        danhSachAnhPhuXemTruoc.innerHTML = '<p class="goi-y-anh-phu">Chưa có ảnh bổ sung.</p>';
        return;
    }
    danhSachAnhPhuXemTruoc.innerHTML = danhSach.map(function (url, viTri) {
        return '<figure><img src="' + lamSachVanBan(url) + '" alt="Ảnh quảng cáo ' + (viTri + 1) + '"><figcaption>Ảnh ' + (viTri + 1) + '</figcaption></figure>';
    }).join("");
}

function xoaAnhPhuXemTruoc() {
    cacDuongDanAnhPhuTam.forEach(function (url) {
        URL.revokeObjectURL(url);
    });
    cacDuongDanAnhPhuTam = [];
    anhPhuHienTai = [];
    oChonAnhPhu.value = "";
    hienAnhPhuXemTruoc([]);
}


// ========================================
// 12. HIỂN THỊ LỖI
// ========================================

function hienLoiSanPham(noiDung) {
    thongBaoSanPham.textContent =
        noiDung;

    thongBaoSanPham.style.color =
        "#c0392b";
}

function lamSachVanBan(noiDung) {
    const oTam =
        document.createElement("div");

    oTam.textContent =
        String(noiDung ?? "");

    return oTam.innerHTML;
}


// ========================================
// 13. TẢI DANH SÁCH
// ========================================

async function taiDanhSachSanPham() {
    danhSachQuanLy.innerHTML =
        "<p>Đang tải danh sách sản phẩm...</p>";

    const { data, error } =
        await supabaseClient
            .from("san_pham")
            .select("*")
            .order(
                "ngay_tao",
                {
                    ascending: false
                }
            );

    if (error) {
        danhSachQuanLy.innerHTML =
            "<p>Không tải được sản phẩm: " +
            lamSachVanBan(error.message) +
            "</p>";

        return;
    }

    capNhatThongKe(data || []);

    if (!data || data.length === 0) {
        danhSachQuanLy.innerHTML =
            "<p>Chưa có dữ liệu sản phẩm.</p>";

        return;
    }

    danhSachQuanLy.innerHTML =
        data.map(function (sanPham) {
            const quyCach =
                sanPham.quy_cach ||
                (
                    sanPham.so_banh
                        ? sanPham.so_banh +
                          " bánh"
                        : "Chưa có quy cách"
                );

            return `
                <article class="san-pham-admin">

                    <img
                        src="${lamSachVanBan(
                            sanPham.anh_url
                        )}"
                        alt="${lamSachVanBan(
                            sanPham.ten
                        )}"
                        loading="lazy"
                    >

                    <div class="noi-dung-san-pham-admin">

                        <h3>
                            ${lamSachVanBan(
                                sanPham.ten
                            )}
                        </h3>

                        <p>
                            ${lamSachVanBan(
                                sanPham.mo_ta
                            )}
                        </p>

                        <p>
                            <strong>
                                ${Number(
                                    sanPham.gia
                                ).toLocaleString(
                                    "vi-VN"
                                )}
                                đồng/
                                ${lamSachVanBan(
                                    quyCach
                                )}
                            </strong>
                        </p>

                        <p class="trang-thai-san-pham">
                            ${
                                sanPham.dang_ban
                                    ? "Đang bán"
                                    : "Đã ẩn"
                            }
                        </p>

                        <div class="cac-nut-san-pham">

                            <button
                                type="button"
                                class="nut nut-sua"
                                data-id="${sanPham.id}"
                            >
                                ✏️ Sửa sản phẩm
                            </button>

                            <button
                                type="button"
                                class="nut nut-an-hien"
                                data-id="${sanPham.id}"
                                data-dang-ban="${sanPham.dang_ban}"
                            >
                                ${
                                    sanPham.dang_ban
                                        ? "🙈 Ẩn sản phẩm"
                                        : "👁️ Hiện sản phẩm"
                                }
                            </button>

                        </div>

                    </div>

                </article>
            `;
        }).join("");

    ganSuKienNutSua();
    ganSuKienNutAnHien();
    locDanhSachSanPham();
}


// ========================================
// 14. THỐNG KÊ
// ========================================

function capNhatThongKe(danhSach) {
    const tong =
        danhSach.length;

    const dangBan =
        danhSach.filter(
            function (sanPham) {
                return (
                    sanPham.dang_ban === true
                );
            }
        ).length;

    oTongSanPham.textContent = tong;
    oSanPhamDangBan.textContent = dangBan;
    oSanPhamDangAn.textContent =
        tong - dangBan;
}


// ========================================
// 15. SỬA SẢN PHẨM
// ========================================

function ganSuKienNutSua() {
    document
        .querySelectorAll(".nut-sua")
        .forEach(function (nut) {
            nut.addEventListener(
                "click",
                function () {
                    suaSanPham(
                        nut.dataset.id
                    );
                }
            );
        });
}

async function suaSanPham(id) {
    thongBaoSanPham.textContent =
        "Đang lấy thông tin sản phẩm...";

    const { data: sanPham, error } =
        await supabaseClient
            .from("san_pham")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {
        hienLoiSanPham(
            "Không lấy được sản phẩm: " +
            error.message
        );

        return;
    }

    const quyCach =
        sanPham.quy_cach ||
        (
            sanPham.so_banh
                ? sanPham.so_banh + " bánh"
                : ""
        );

    document
        .getElementById("ten-san-pham")
        .value =
            sanPham.ten ?? "";

    document
        .getElementById("gia-san-pham")
        .value =
            sanPham.gia ?? "";

    document
        .getElementById("quy-cach")
        .value =
            quyCach;

    document
        .getElementById("mo-ta-san-pham")
        .value =
            sanPham.mo_ta ?? "";

    formSanPham.dataset.idSua =
        sanPham.id;

    nutHuySua.classList.remove("an");

    if (sanPham.anh_url) {
        anhXemTruoc.src =
            sanPham.anh_url;

        anhXemTruoc.classList.remove("an");
    }

    anhPhuHienTai = Array.isArray(sanPham.anh_phu)
        ? sanPham.anh_phu.filter(Boolean)
        : [];
    hienAnhPhuXemTruoc(anhPhuHienTai);

    oChonAnh.value = "";
    oChonAnhPhu.value = "";

    thongBaoSanPham.textContent =
        "Đang sửa sản phẩm. Để trống ảnh nếu muốn giữ ảnh cũ.";

    thongBaoSanPham.style.color =
        "#176b3a";

    formSanPham.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ========================================
// 16. HỦY SỬA
// ========================================

function huyCheDoSua() {
    formSanPham.reset();

    delete formSanPham.dataset.idSua;

    xoaAnhXemTruoc();
    xoaAnhPhuXemTruoc();

    thongBaoSanPham.textContent = "";

    nutHuySua.classList.add("an");

    ketThucLuuSanPham();
}

nutHuySua.addEventListener(
    "click",
    function () {
        huyCheDoSua();
    }
);


// ========================================
// 17. ẨN/HIỆN SẢN PHẨM
// ========================================

function ganSuKienNutAnHien() {
    document
        .querySelectorAll(
            ".nut-an-hien"
        )
        .forEach(function (nut) {
            nut.addEventListener(
                "click",
                async function () {
                    const id =
                        nut.dataset.id;

                    const dangBan =
                        nut.dataset
                            .dangBan ===
                        "true";

                    nut.disabled = true;
                    nut.textContent =
                        "Đang cập nhật...";

                    const {
                        data,
                        error
                    } = await supabaseClient
                        .from("san_pham")
                        .update({
                            dang_ban:
                                !dangBan
                        })
                        .eq("id", id)
                        .select("id");

                    if (
                        error ||
                        !data ||
                        data.length === 0
                    ) {
                        alert(
                            error
                                ? error.message
                                : "Không có quyền cập nhật sản phẩm."
                        );

                        nut.disabled = false;
                        return;
                    }

                    await taiDanhSachSanPham();
                }
            );
        });
}


// ========================================
// 18. TÌM KIẾM VÀ LỌC
// ========================================

function boDauTiengViet(noiDung) {
    return String(noiDung)
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
}

function locDanhSachSanPham() {
    const tuKhoa =
        boDauTiengViet(
            oTimSanPham.value
        );

    const trangThai =
        oLocTrangThai.value;

    document
        .querySelectorAll(
            ".san-pham-admin"
        )
        .forEach(function (sanPham) {
            const ten =
                sanPham.querySelector("h3")
                    ?.textContent || "";

            const nutAnHien =
                sanPham.querySelector(
                    ".nut-an-hien"
                );

            const dangBan =
                nutAnHien?.dataset
                    .dangBan === "true";

            const dungTen =
                boDauTiengViet(ten)
                    .includes(tuKhoa);

            let dungTrangThai = true;

            if (trangThai === "dang-ban") {
                dungTrangThai = dangBan;
            }

            if (trangThai === "dang-an") {
                dungTrangThai = !dangBan;
            }

            sanPham.style.display =
                dungTen && dungTrangThai
                    ? ""
                    : "none";
        });
}

oTimSanPham.addEventListener(
    "input",
    locDanhSachSanPham
);

oLocTrangThai.addEventListener(
    "change",
    locDanhSachSanPham
);

oChonAnhPhu.addEventListener("change", function () {
    const danhSachTep = Array.from(oChonAnhPhu.files || []);
    cacDuongDanAnhPhuTam.forEach(function (url) {
        URL.revokeObjectURL(url);
    });
    cacDuongDanAnhPhuTam = [];

    if (danhSachTep.length > 8) {
        hienLoiSanPham("Chỉ được chọn tối đa 8 ảnh quảng cáo.");
        oChonAnhPhu.value = "";
        hienAnhPhuXemTruoc(anhPhuHienTai);
        return;
    }

    const tepKhongHopLe = danhSachTep.find(function (tep) {
        return !tep.type.startsWith("image/") || tep.size > 5 * 1024 * 1024;
    });
    if (tepKhongHopLe) {
        hienLoiSanPham("Mỗi ảnh quảng cáo phải là tệp ảnh và nhỏ hơn 5 MB.");
        oChonAnhPhu.value = "";
        hienAnhPhuXemTruoc(anhPhuHienTai);
        return;
    }

    cacDuongDanAnhPhuTam = danhSachTep.map(function (tep) {
        return URL.createObjectURL(tep);
    });
    hienAnhPhuXemTruoc(cacDuongDanAnhPhuTam.length ? cacDuongDanAnhPhuTam : anhPhuHienTai);
    thongBaoSanPham.textContent = "";
});

// Luồng lưu trực tiếp cho nút quản trị. Tách khỏi submit của trình duyệt
// để nút luôn phản hồi và mọi lỗi đều hiện ngay trên màn hình.
async function taiMotAnhLenKho(tepAnh, thuMuc) {
    const duoiAnh = layDuoiAnh(tepAnh);
    const ma = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const duongDan = thuMuc + "/" + Date.now() + "-" + ma + "." + duoiAnh;
    const { error } = await supabaseClient.storage
        .from("anh-san-pham")
        .upload(duongDan, tepAnh, { contentType: tepAnh.type, upsert: false });
    if (error) throw new Error("Không tải được ảnh: " + error.message);
    const { data } = supabaseClient.storage
        .from("anh-san-pham")
        .getPublicUrl(duongDan);
    return data.publicUrl;
}

async function luuSanPhamTrucTiep() {
    thongBaoSanPham.textContent = "Đang kiểm tra thông tin...";
    thongBaoSanPham.style.color = "#555555";
    nutLuuSanPham.disabled = true;
    nutLuuSanPham.textContent = "Đang xử lý...";

    try {
        const idSua = formSanPham.dataset.idSua || "";
        const ten = document.getElementById("ten-san-pham").value.trim();
        const gia = Number(document.getElementById("gia-san-pham").value);
        const quyCach = document.getElementById("quy-cach").value.trim();
        const moTa = document.getElementById("mo-ta-san-pham").value.trim();
        const tepAnhDaiDien = oChonAnh.files[0];
        const cacTepAnhPhu = Array.from(oChonAnhPhu.files || []);

        if (!ten) throw new Error("Vui lòng nhập tên sản phẩm.");
        if (!Number.isFinite(gia) || gia <= 0) throw new Error("Giá sản phẩm phải lớn hơn 0.");
        if (!quyCach) throw new Error("Vui lòng nhập số lượng hoặc quy cách.");
        if (!idSua && !tepAnhDaiDien) throw new Error("Vui lòng chọn ảnh đại diện.");
        if (cacTepAnhPhu.length > 8) throw new Error("Chỉ được chọn tối đa 8 ảnh quảng cáo.");

        const tatCaAnh = [tepAnhDaiDien, ...cacTepAnhPhu].filter(Boolean);
        const anhLoi = tatCaAnh.find(function (tep) {
            return !tep.type.startsWith("image/") || tep.size > 5 * 1024 * 1024;
        });
        if (anhLoi) throw new Error("Mỗi ảnh phải là tệp ảnh và nhỏ hơn 5 MB.");

        thongBaoSanPham.textContent = "Đang tải ảnh lên...";
        let anhDaiDienMoi = "";
        if (tepAnhDaiDien) {
            anhDaiDienMoi = await taiMotAnhLenKho(tepAnhDaiDien, "san-pham");
        }

        let cacAnhPhuMoi = anhPhuHienTai;
        if (cacTepAnhPhu.length) {
            cacAnhPhuMoi = [];
            for (let i = 0; i < cacTepAnhPhu.length; i += 1) {
                thongBaoSanPham.textContent = "Đang tải ảnh quảng cáo " + (i + 1) + "/" + cacTepAnhPhu.length + "...";
                cacAnhPhuMoi.push(await taiMotAnhLenKho(cacTepAnhPhu[i], "san-pham/anh-phu"));
            }
        }

        const laHot = document.getElementById("noi-bat-san-pham").checked;
        const thuTuHot = Number(document.getElementById("thu-tu-hot").value);
        const duLieu = {
            ten: ten,
            gia: gia,
            quy_cach: quyCach,
            mo_ta: moTa,
            so_banh: 1,
            noi_bat: laHot,
            thu_tu_hot: laHot ? (thuTuHot || 999) : null,
            anh_phu: cacAnhPhuMoi
        };
        if (anhDaiDienMoi) duLieu.anh_url = anhDaiDienMoi;

        thongBaoSanPham.textContent = "Đang lưu sản phẩm...";
        let ketQua;
        if (idSua) {
            ketQua = await supabaseClient.from("san_pham").update(duLieu).eq("id", idSua).select("id");
        } else {
            ketQua = await supabaseClient.from("san_pham").insert({ ...duLieu, dang_ban: true }).select("id");
        }
        if (ketQua.error) throw new Error("Không lưu được sản phẩm: " + ketQua.error.message);
        if (!ketQua.data || ketQua.data.length === 0) throw new Error("Không lưu được sản phẩm. Hãy kiểm tra quyền INSERT/UPDATE trong Supabase.");

        thongBaoSanPham.textContent = idSua
            ? "Đã sửa sản phẩm thành công."
            : "Đã thêm sản phẩm thành công.";
        thongBaoSanPham.style.color = "#176b3a";
        formSanPham.reset();
        delete formSanPham.dataset.idSua;
        nutHuySua.classList.add("an");
        xoaAnhXemTruoc();
        xoaAnhPhuXemTruoc();
        await taiDanhSachSanPham();
    } catch (loi) {
        hienLoiSanPham(loi && loi.message ? loi.message : "Có lỗi xảy ra khi lưu sản phẩm.");
    } finally {
        nutLuuSanPham.disabled = false;
        nutLuuSanPham.textContent = "💾 Lưu sản phẩm";
    }
}

nutLuuSanPham.addEventListener("click", luuSanPhamTrucTiep);

window.addEventListener("unhandledrejection", function (suKien) {
    const loi = suKien.reason;
    hienLoiSanPham("Lỗi hệ thống: " + (loi && loi.message ? loi.message : String(loi)));
    ketThucLuuSanPham();
});
