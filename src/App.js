import { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { publicRoutes, privateRoutes } from '~/routes/routes';
import DefaultLayout from './layouts/DefaultLayout/DefaultLayout';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Admin/Login/Login';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Error404 from './pages/Error404/Error404';
import { clearExperienceCache, clearCategoryCache } from './services/utils';

// RouteLogger component to log route changes
function RouteLogger() {
    const location = useLocation();
    
    useEffect(() => {
        console.log('Route changed:', location.pathname);
    }, [location]);
    
    return null;
}

function App() {
    // Clear experience and category cache when the app starts
    useEffect(() => {
        clearExperienceCache();
        clearCategoryCache();
    }, []);

    // Listen for app:dataRefresh event to update UI when data changes
    useEffect(() => {
        const handleDataRefresh = (event) => {
            console.log('Data refresh event received, timestamp:', event.detail.timestamp);
            // Clear all caches to force components to fetch fresh data
            clearExperienceCache();
            clearCategoryCache();
            
            // Refresh the page or rerender specific components if needed
            // If you want to reload the entire page (not recommended):
            // window.location.reload();
            
            // Instead, you can notify components to refresh their data
            // via context or other state management approach
        };

        // Add event listener
        window.addEventListener('app:dataRefresh', handleDataRefresh);

        // Clean up
        return () => {
            window.removeEventListener('app:dataRefresh', handleDataRefresh);
        };
    }, []);

    return (
        <Router>
            <AuthProvider>
                <div className="App">
                    <ScrollToTop />
                    <RouteLogger />
                    <Routes>
                        {publicRoutes.map((route, index) => {
                            const Page = route.component;
                            let Layout = DefaultLayout;

                            if (route.layout) {
                                Layout = route.layout;
                            } else if (route.layout === null) {
                                Layout = Fragment;
                            }

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <Layout baseRoute={route.baseRoute} categoryType={route.categoryType}>
                                            <Page />
                                        </Layout>
                                    }
                                />
                            );
                        })}

                        {privateRoutes.map((route, index) => {
                            const Page = route.component;
                            const Layout = route.layout || DefaultLayout;

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <PrivateRoute>
                                            <Layout baseRoute={route.baseRoute} categoryType={route.categoryType}>
                                                <Page />
                                            </Layout>
                                        </PrivateRoute>
                                    }
                                />
                            );
                        })}

                        <Route path="/login" element={<Login />} />
                        <Route path="*" element={<Error404 />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    return user ? children : <Navigate to="/login" />;
}

export default App;
