import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import SessionChecker from '../components/SessionChecker';
import Navbar from '../components/Navbar';

const Tables = () => {
    // Navigation and location details
    const navigate = useNavigate();
    const location = useLocation();

    // Connection details
    const [connectionID, setConnectionID] = useState();
    const [connectionName, setConnectionName] = useState("");
    const [databaseName, setDatabaseName] = useState("");
    // Database details
    const [tables, setTables] = useState([]);
    const [selectedTableName, setSelectedTableName] = useState("");
    const [selectedNewTableName, setSelectedNewTableName] = useState("");
    const [createTableName, setCreateTableName] = useState("");
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    // Error handling
    const [error, setError] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);
    // Loading state
    const [loading, setLoading] = useState(true);

    // Check if session is valid
    useEffect(() => {
        if (!SessionChecker()) {
            navigate("/");
        }
    }, [navigate]);

    // Error handling
    const showError = (message) => {
        setErrorVisible(true);
        setError(message);
        setTimeout(() => {
            setErrorVisible(false);
            setError("");
        }, 5000);
    }

    // Set connection details
    useEffect(() => {
        setConnectionID(location.state.connection_id);
        setConnectionName(location.state.connection_name);
        setDatabaseName(location.state.database_name);
    }, [location.state.connection_id]);

    // Refresh tables
    const refreshTables = () => {
        axios.post(`${import.meta.env.VITE_API_URL}/get_tables?page=${currentPage}&size=7`, {
            session_id: Cookies.get("session_id"),
            connection_id: connectionID,
            database: databaseName
        })
        .then(response => {
            if (response.data.items.length === 0 && response.status === 200) {
                setCurrentPage(currentPage - 1);
                setLoading(false);
                return;
            }
            setMaxPage(response.data.pages);
            setTables(response.data.items);
            setLoading(false);
        })
        .catch(error => {
        });
    }

    const deleteTable = () => {
        axios.post(`${import.meta.env.VITE_API_URL}/delete_table`, {
            session_id: Cookies.get("session_id"),
            connection_id: connectionID,
            database: databaseName,
            table: selectedTableName
        })
        .then(response => {
            if (response.data.message === "Table deleted") {
                document.getElementById('my_modal_4').close();
                refreshTables();
            }
        })
        .catch(error => {
        });
    }


    // Load tables
    useEffect(() => {
        refreshTables();
    }, [connectionID, currentPage]);

    return (
        <>
         <div className="flex space-x-12">
            <Navbar />
            <div className='pt-10 pr-10 w-full'>
            <div className="breadcrumbs text-sm">
                <ul>
                    <li><Link to="/dashboard">Home</Link></li>
                    <li><Link to="/databases" state={{
                        connection_id: connectionID,
                        connection_name: connectionName
                    }}>{connectionName}</Link></li>
                    <li>{databaseName}</li>
                </ul>
                </div>
                <h1 className="text-5xl font-bold">{databaseName} Tables</h1>
                
                <div className="divider"></div>
                <div className="w-full">
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <div className="flex justify-center pt-20">
                                <span className="loading loading-infinity loading-lg"></span>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th className="text-xl w-1/12">ID</th>
                                        <th className="text-xl">Table Name</th>
                                        <th className="text-xl w-1/12">Rows</th>
                                        <th className="text-xl w-2/12">Size</th>
                                        <th className="text-xl w-3/12">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tables.map((table, index) => (
                                        <tr key={index}>
                                            <td className='text-base w-1/12'>{index}</td>
                                            <td className='text-base'>
                                                <button className="btn btn-ghost w-full justify-start text-left" onClick={() => {
                                                    navigate("/table_view", {
                                                        state: {
                                                            connection_id: connectionID,
                                                            connection_name: connectionName,
                                                            database_name: databaseName,
                                                            table_name: table.name
                                                        }
                                                    });
                                                }}>{table.name}</button>  
                                            </td>
                                            <td className='text-base w-1/12'>{table.rows}</td>
                                            <td className='text-base w-2/12'>{table.size}</td>
                                            <td className='text-base w-3/12'>
                                                <div className="space-x-3">
                                                    <Link to="/table_edit" state={{
                                                        connection_id: connectionID,
                                                        connection_name: connectionName,
                                                        database_name: databaseName,
                                                        table_name: table.name
                                                    }} className="btn btn-neutral">Edit</Link>
                                                    <button className="btn btn-neutral" onClick={() => {
                                                        setSelectedTableName(table.name);
                                                        document.getElementById('my_modal_4').showModal();
                                                    }}>Delete</button>
                                            </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn btn-neutral w-full" onClick={() => {
                                navigate("/table_create", {
                                    state: {
                                        connection_id: connectionID,
                                        connection_name: connectionName,
                                        database_name: databaseName
                                    }
                                });
                            }}>Create new Table</button>
                            <div className="flex justify-center items-center join pt-5">
                                {currentPage === 1 ? (
                                    <button className="join-item btn" disabled>«</button>
                                ) : (
                                    <button className="join-item btn" onClick={() => setCurrentPage(currentPage-1)}>«</button>
                                )}
                                <button className="join-item btn">Page {currentPage}</button>
                                {currentPage < maxPage ? (
                                    <button className="join-item btn" onClick={() => setCurrentPage(currentPage + 1)}>»</button>
                                ) : (
                                    <button className="join-item btn" disabled>»</button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <dialog id="my_modal_4" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Delete {selectedTableName}</h3>
                        <div className="py-4">
                            <div className='space-y-2'>
                                <label className="input flex items-center gap-2">
                                    Are you sure you want to delete {selectedTableName}? This action cannot be undone.
                                </label>
                                <button className="btn btn-neutral w-full" onClick={deleteTable}>Delete</button>
                            </div>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
        </>
    );
}

export default Tables;