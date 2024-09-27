import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import SessionChecker from '../components/SessionChecker';
import Navbar from '../components/Navbar';

const TableView = () => {
    // Navigation and location details
    const navigate = useNavigate();
    const location = useLocation();

    // Connection details
    const [connectionID, setConnectionID] = useState();
    const [connectionName, setConnectionName] = useState('');
    const [databaseName, setDatabaseName] = useState('');
    const [tableName, setTableName] = useState('');
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [errorVisible, setErrorVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);

    useEffect(() => {
        if (!SessionChecker()) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        setConnectionID(location.state.connection_id);
        setConnectionName(location.state.connection_name);
        setDatabaseName(location.state.database_name);
        setTableName(location.state.table_name);
    }, [location.state]);

    useEffect(() => {
        if (connectionID && databaseName && tableName) {
            axios
                .post(
                    `${import.meta.env.VITE_API_URL}/get_table_data_values?page=${currentPage}&size=7`,
                    {
                        session_id: Cookies.get('session_id'),
                        connection_id: connectionID,
                        database_name: databaseName,
                        table_name: tableName,
                    }
                )
                .then((response) => {
                    setData(response.data.items);
                    setMaxPage(response.data.pages);
                    console.log(response.data);
                })
                .catch((error) => {
                    setError(error.message);
                    setErrorVisible(true);
                    console.log(error);
                });
        }
    }, [connectionID, databaseName, tableName, currentPage]);

    return (
        <>
            <div className="flex space-x-12">
                <Navbar />
                <div className="pt-10 pr-10 w-full">
                    <div className="breadcrumbs text-sm">
                        <ul>
                            <li><Link to="/dashboard">Home</Link></li>
                            <li>
                                <Link to="/databases" state={{ connection_id: connectionID, connection_name: connectionName }}>
                                    {connectionName}
                                </Link>
                            </li>
                            <li>
                                <Link to="/tables" state={{ connection_id: connectionID, connection_name: connectionName, database_name: databaseName }}>
                                    {databaseName}
                                </Link>
                            </li>
                            <li>View Table</li>
                        </ul>
                    </div>
                    <h1 className="text-5xl font-bold">View Table</h1>
                    <div className="divider"></div>
                    <div className="w-full">
                        {errorVisible && (
                            <div className="pb-5">
                                <div role="alert" className="alert alert-error">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 shrink-0 stroke-current"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}
                        <table className="table w-full">
                            {data.length > 0 && (
                                <>
                                    <thead>
                                        <tr>
                                            {Object.keys(data[0].values).map((key) => (
                                                <th key={key}>{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row) => (
                                            <tr key={row.id}>
                                                {Object.values(row.values).map((value, index) => (
                                                    <td key={index}>{value !== null ? value : ''}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                        </table>
                        <div className="flex justify-center items-center join pt-5">
                            {currentPage === 1 ? (
                                <button className="join-item btn" disabled>
                                    «
                                </button>
                            ) : (
                                <button className="join-item btn" onClick={() => setCurrentPage(currentPage - 1)}>
                                    «
                                </button>
                            )}
                            <button className="join-item btn">Page {currentPage}</button>
                            {currentPage < maxPage ? (
                                <button className="join-item btn" onClick={() => setCurrentPage(currentPage + 1)}>
                                    »
                                </button>
                            ) : (
                                <button className="join-item btn" disabled>
                                    »
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TableView;
