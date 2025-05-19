import React from 'react';
import { Helmet, HelmetProvider } from "react-helmet-async";
import Overview from './Overview/Overview';
import Products from './Products/Products';
import Services from './Services/Services';
import NewsLibrary from './NewsLibrary/NewsLibrary';
import Banner from './Banner/Banner';
import Experiences from './Experiences/Experiences';
import Teams from './Teams/Teams';

const Home = () => (
    <article>
        <HelmetProvider>
            <title>HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
            <meta
                name="description"
                content="HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật hoạt động đa ngành nghề, trong đó tiêu biểu có thể kể đến là nuôi cá lồng, cải tạo nâng cấp vườn cây quanh các hồ thủy điện, phát triển về du lịch sinh thái, du lịch nông nghiệp. Ngoài ra còn thực hiện sản xuất các loại thực phẩm như chả cá, trái cây thực phẩm sấy khô và sấy dẻo, các loại tinh dầu tự nhiên,…"
            />
            <meta
                name="keywords"
                content="dịch vụ nông nghiệp du lịch, hợp tác xã, sản phẩm nông nghiệp, phunongbuondon"
            />
            <meta name="author" content="HTX Nông Nghiệp - Du Lịch Phú Nông Buôn" />
        </HelmetProvider>
        <Banner />
        <Overview />
        <Products />
        <Services />
        <Experiences />
        <NewsLibrary />
        <Teams />
    </article>
);

export default Home;
