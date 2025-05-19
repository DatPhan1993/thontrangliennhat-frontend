import classNames from 'classnames/bind';
import React from 'react';
import Title from '~/components/Title/Title';
import styles from './About.module.scss';
import { Helmet, HelmetProvider } from "react-helmet-async";

const cx = classNames.bind(styles);

const About = () => (
    <article className={cx('wrapper')}>
        <HelmetProvider>
            <title>Giới thiệu | HTX Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
            <meta
                name="description"
                content="HTX Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật hoạt động đa ngành nghề, trong đó tiêu biểu có thể kể đến là nuôi cá lồng, cải tạo nâng cấp vườn cây quanh các hồ thủy điện, phát triển về du lịch sinh thái, du lịch nông nghiệp. Ngoài ra còn thực hiện sản xuất các loại thực phẩm như chả cá, trái cây thực phẩm sấy khô và sấy dẻo, các loại tinh dầu tự nhiên,…"
            />
            <meta
                name="keywords"
                content="dịch vụ nông nghiệp du lịch, hợp tác xã, sản phẩm nông nghiệp, thontrangliennhat"
            />
            <meta name="author" content="HTX Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật" />
        </HelmetProvider>
        <div className={cx('inner')}>
            <Title text="Về Chúng Tôi" />
            <div className={cx('content')}>
                <p>
                Hợp tác xã Sản xuất Nông nghiệp và Dịch vụ Tổng hợp Liên Nhật – Thạch Hạ là một mô hình nông nghiệp 
                hữu cơ tiên tiến tại xã Thạch Hạ, thành phố Hà Tĩnh. Được thành lập vào ngày 17/6/2022, hợp tác xã này 
                do ông Nguyễn Hữu Quyền làm giám đốc và hiện đang hoạt động tích cực với mã số thuế 3002256235. 
                </p>
                <p>
                    <strong className={cx('section-title')}>QUÁ TRÌNH HÌNH THÀNH VÀ PHÁT TRIỂN</strong>
                </p>
                <p>
                Trước khi Hợp tác xã Sản xuất Nông nghiệp và Dịch vụ Tổng hợp Liên Nhật ra đời, vùng đất này – nằm 
                ở cuối làng Liên Nhật, xã Thạch Hạ – chỉ là một bãi trũng hoang vu, đất đai nhiễm phèn nặng, cỏ dại 
                mọc um tùm, không ai muốn bén mảng đến canh tác. Mỗi khi mưa lớn, cả cánh đồng chìm trong nước, người 
                dân chỉ biết thở dài lắc đầu gọi đó là "vùng đất chết".Thế nhưng, nơi tưởng như vô dụng ấy lại là nơi 
                bắt đầu cho một cuộc "hồi sinh" kỳ diệu. Người khởi xướng là ông Nguyễn Hữu Quyền – một người con của 
                quê hương, từng đi làm ăn xa, nhưng mang trong lòng nỗi đau đáu với mảnh đất quê nhà nghèo khó. Ông 
                nhìn thấy ở vùng đất trũng không chỉ là thử thách, mà là cơ hội – cơ hội để tạo nên một mô hình nông 
                nghiệp hữu cơ bền vững và khác biệt.
                   Ông Quyền cùng một nhóm nông dân dũng cảm quyết định thành lập hợp tác xã vào giữa năm 2022, mang 
                tên Liên Nhật – theo đúng tên làng, như một lời cam kết gắn bó và phục hưng. Họ bắt tay vào việc cải 
                tạo đất: đào ao, be bờ, xử lý phèn, xây hệ thống kênh mương dẫn nước và phân vùng sản xuất. Việc đầu 
                tiên là "bắt mạch cho đất", để đất sống lại. Từ đó, mô hình "3 trong 1" ra đời: vừa trồng lúa hữu cơ, 
                vừa nuôi cá, vừa thả tôm càng xanh. Những sinh vật sống trong hệ sinh thái cộng sinh ấy không chỉ giúp 
                đất tơi xốp, cải tạo môi trường mà còn giảm tối đa chi phí phân bón, thuốc bảo vệ thực vật – giữ trọn 
                hương vị tinh khiết cho sản phẩm.
                  Chưa dừng lại ở đó, ông Quyền và các cộng sự còn theo đuổi việc xây dựng thương hiệu gạo hữu cơ Liên
                   Nhật – thứ gạo thơm dẻo, sạch từ hạt đến vỏ, được chứng nhận OCOP 3 sao. Gạo không chỉ là sản phẩm 
                   nông nghiệp, mà là tinh túy của vùng đất trũng hồi sinh, là niềm tự hào của người dân Thạch Hạ.

                Giờ đây, nơi từng là cánh đồng hoang hóa đã trở thành một điểm sáng của thành phố Hà Tĩnh trong phát 
                triển nông nghiệp sạch. Không ít người từ các nơi khác tìm về học hỏi mô hình. Và trong tương lai gần, 
                nơi đây còn được kỳ vọng trở thành điểm đến du lịch sinh thái – nơi du khách có thể thăm ruộng, bắt cá, 
                trải nghiệm "một ngày làm nông dân hữu cơ".
                </p>

                <p>
                    <strong className={cx('section-title')}>ĐỊNH HƯỚNG TƯƠNG LAI</strong>
                </p>
                <p>
                Hợp tác xã Liên Nhật không chỉ tập trung vào sản xuất nông nghiệp mà còn hướng đến phát triển du lịch 
                sinh thái, tạo ra một mô hình kinh tế bền vững và đa dạng. Việc kết hợp giữa nông nghiệp hữu cơ và du 
                lịch hứa hẹn sẽ mang lại nhiều cơ hội phát triển cho cộng đồng địa phương. ​

                </p>
            </div>
        </div>
    </article>
);

export default About;
