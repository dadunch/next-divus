const Home = () => {
    return null; // Tidak perlu render apa-apa karena akan diredirect server-side
};

export async function getServerSideProps() {
    return {
        redirect: {
            destination: '/User/Home',
            permanent: false, // 307 Temporary Redirect
        },
    };
}

export default Home;