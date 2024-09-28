import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import SessionChecker from '../components/SessionChecker';
import Navbar from '../components/Navbar';

const TableView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [connectionID, setConnectionID] = useState();
    const [connectionName, setConnectionName] = useState('');
    const [databaseName, setDatabaseName] = useState('');
    const [tableName, setTableName] = useState('');
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [errorVisible, setErrorVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedOldRow, setSelectedOldRow] = useState(null);
    const [selectedNewRow, setSelectedNewRow] = useState({ values: {} });

    useEffect(() => {
        if (!SessionChecker()) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        if (location.state) {
            setConnectionID(location.state.connection_id);
            setConnectionName(location.state.connection_name);
            setDatabaseName(location.state.database_name);
            setTableName(location.state.table_name);
        }
    }, [location.state]);

    const retrieveTableData = () => {
        if (connectionID && databaseName && tableName) {
            axios.post(`${import.meta.env.VITE_API_URL}/get_table_data_values?page=${currentPage}&size=7`, {
                    session_id: Cookies.get('session_id'),
                    connection_id: connectionID,
                    database_name: databaseName,
                    table_name: tableName,
                })
                .then((response) => {
                    setData(response.data.items || []); // Set empty array if items is undefined
                    setMaxPage(response.data.pages || 1); // Set to 1 if pages is undefined
                    console.log(response.data)
                })
                .catch((error) => {
                    setError(error.message);
                    setErrorVisible(true);
                });
        }
    };

    useEffect(() => {
        retrieveTableData();
    }, [connectionID, databaseName, tableName, currentPage]);

    const handleEdit = () => {
        axios.post(`${import.meta.env.VITE_API_URL}/edit_table_data`, {
            session_id: Cookies.get('session_id'),
            connection_id: connectionID,
            database_name: databaseName,
            table_name: tableName,
            row: selectedOldRow,  // use old row data
            new_row: selectedRow,  // use updated row data
        })
        .then((response) => {
            retrieveTableData();
            document.getElementById('my_modal_3').close();
        })
        .catch((error) => {
            setError(error.message);
            setErrorVisible(true);
        });
    };

    const handleDelete = (row) => {
        axios.post(`${import.meta.env.VITE_API_URL}/delete_table_data`, {
            session_id: Cookies.get('session_id'),
            connection_id: connectionID,
            database_name: databaseName,
            table_name: tableName,
            row: row,
        })
        .then((response) => {
            retrieveTableData();
        })
        .catch((error) => {
            setError(error.message);
            setErrorVisible(true);
        });
    };

    const handleAdd = () => {
        axios.post(`${import.meta.env.VITE_API_URL}/add_table_data`, {
            session_id: Cookies.get('session_id'),
            connection_id: connectionID,
            database_name: databaseName,
            table_name: tableName,
            row: selectedNewRow,
        })
        .then((response) => {
            retrieveTableData();
            document.getElementById('my_modal_4').close();
        })
        .catch((error) => {
            setError(error.message);
            setErrorVisible(true);
        });
    };

    const openEditModal = (row) => {
        setSelectedOldRow(row);  // save old row data
        setSelectedRow({ ...row });  // create a copy of the row for editing
        document.getElementById('my_modal_3').showModal();
    };

    useEffect(() => {
        console.log(selectedOldRow);
        console.log(selectedRow);
    }, [selectedOldRow, selectedRow]);

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
                                            {Object.keys(data[0].values || {}).map((key) => (
                                                <th className='text-xl' key={key}>{key}</th>
                                            ))}
                                            <th className='text-xl'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row) => (
                                            <tr key={row.id}>
                                                {Object.values(row.values || {}).map((value, index) => (
                                                    <td key={index}>{value !== null ? value : ''}</td>
                                                ))}
                                                <td>
                                                    <button onClick={() => openEditModal(row)} className="btn btn-neutral mr-2">Edit</button>
                                                    <button onClick={() => handleDelete(row)} className="btn btn-neutral">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                        </table>
                        <button className="btn btn-neutral mt-5 w-full" onClick={() => document.getElementById('my_modal_4').showModal()}>Add Row</button>
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

                    <dialog id="my_modal_3" className="modal">
                        <div className="modal-box">
                            <form method="dialog">
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                            </form>
                            <h3 className="font-bold text-lg">Edit Table Data</h3>
                            <div className="divider"></div>
                            {selectedRow && (
                                <form method="dialog">
                                    <div className='space-y-2'>
                                        {Object.keys(selectedRow.values || {}).map((key) => (
                                            <div className="form-control" key={key}>
                                                <label className="input input-bordered flex items-center gap-2">
                                                    {key}
                                                    <input type="text" defaultValue={selectedRow.values[key]} className="grow" onChange={(e) => {
                                                        setSelectedRow(prev => ({
                                                            ...prev,
                                                            values: {
                                                                ...prev.values,
                                                                [key]: e.target.value // Update the selectedRow values
                                                            }
                                                        }));
                                                    }} />
                                                </label>
                                            </div>
                                        ))}
                                        <div className="form-actions">
                                            <button className="btn btn-primary w-full" type="button" onClick={handleEdit}>Save</button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </dialog>

                    <dialog id="my_modal_4" className="modal">
                        <div className="modal-box">
                            <form method="dialog">
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                            </form>
                            <h3 className="font-bold text-lg">Add Table Data</h3>
                            <div className="divider"></div>
                            <form method="dialog">
                                <div className='space-y-2'>
                                    {data.length > 0 && Object.keys(data[0].values || {}).map((key) => (
                                        <div className="form-control" key={key}>
                                            <label className="input input-bordered flex items-center gap-2">
                                                {key}
                                                <input type="text" className="grow" onChange={(e) => {
                                                    setSelectedNewRow(prev => ({
                                                        ...prev,
                                                        values: {
                                                            ...prev.values,
                                                            [key]: e.target.value // Update the selectedNewRow values
                                                        }
                                                    }));
                                                }} />
                                            </label>
                                        </div>
                                    ))}
                                    <div className="form-actions">
                                        <button className="btn btn-primary w-full" type="button" onClick={handleAdd}>Add Row</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </dialog>
                </div>
            </div>
        </>
    );
};

export default TableView;
