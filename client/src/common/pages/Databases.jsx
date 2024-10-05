import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import { FaEdit, FaTrash  } from 'react-icons/fa';
import { makePostRequest } from '../utils/api';
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { sql } from "@codemirror/lang-sql";

const Databases = () => {
    // Navigation and location details
    const navigate = useNavigate();
    const location = useLocation();

    // Connection details
    const [connectionID, setConnectionID] = useState();
    const [connectionName, setConnectionName] = useState("");

    // Database details
    const [databases, setDatabases] = useState([]);
    const [selectedDatabaseName, setSelectedDatabaseName] = useState("");
    const [selectedNewDatabaseName, setSelectedNewDatabaseName] = useState("");
    const [createDatabaseName, setCreateDatabaseName] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);

    // Error handling
    const [error, setError] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    // SQL editor
    const [editorValue, setEditorValue] = useState("");
    const [queryResult, setQueryResult] = useState([]);
    const [queryResultVisible, setQueryResultVisible] = useState(false);
    const [queryError, setQueryError] = useState("");
    const [queryErrorVisible, setQueryErrorVisible] = useState(false);
    const [allDatabases, setAllDatabases] = useState([]);

    // New state for active accordion
    const [activeAccordion, setActiveAccordion] = useState('database');

    useEffect(() => {
        makePostRequest("/check_session")
        .then(response => {
            if(response.data.message !== "Session is valid"){
                navigate("/");
            }
        })
        .catch(error => {
            navigate("/");
        });
    }, []);

    // Show error message
    const showError = (message) => {
        setErrorVisible(true);
        setError(message);
        setTimeout(() => {
            setErrorVisible(false);
            setError("");
        }, 5000);
    };

    // Set connection details
    useEffect(() => {
        setConnectionID(location.state.connection_id);
        setConnectionName(location.state.connection_name);
    }, [location.state.connection_id]);

    // Refresh databases
    const refreshDatabases = () => {
        if (connectionID === undefined) {
            return;
        }
        makePostRequest("/get_databases?page=" + currentPage + "&size=6", {
            connection_id: connectionID,
            database: selectedDatabaseName
        })
        .then(response => {
            if (response.data.items.length === 0) {
                setCurrentPage(currentPage - 1);
                return;
            }
            setMaxPage(response.data.pages);
            setDatabases(response.data.items);
            setLoading(false); // Set loading to false after data is successfully fetched
        })
        .catch(error => {
            showError("Error fetching databases");
        });
    };

    const get_all_databases = () => {
        makePostRequest("/get_databases", {
            connection_id: connectionID
        })
        .then(response => {
            setAllDatabases(response.data.items);
        })
        .catch(error => {
            showError("Error fetching databases");
        });
    };
    // Load databases
    useEffect(() => {
        refreshDatabases();
        get_all_databases();
    }, [connectionID, currentPage]);

    // Save edited database
    const saveEditDatabase = () => {
        makePostRequest("/edit_database", {
            connection_id: connectionID,
            old_database_name: selectedDatabaseName,
            new_database_name: selectedNewDatabaseName
        })
        .then(response => {
            if (response.data.message === "Database edited") {
                document.getElementById('my_modal_3').close();
                refreshDatabases();
            } else {
                showError(response.data.message);
            }
        })
        .catch(error => {
            showError("Unknown error editing database.");
        });
    };

    // Delete database
    const deleteDatabase = () => {
        makePostRequest("/delete_database", {
            connection_id: connectionID,
            database_name: selectedDatabaseName
        })
        .then(response => {
            if (response.data.message === "Database deleted") {
                document.getElementById('my_modal_4').close();
                refreshDatabases();
            }
        })
        .catch(error => {
            showError("Unknown error deleting database.");
        });
    };

    // Create new database
    const createDatabase = () => {
        makePostRequest("/create_database", {
            connection_id: connectionID,
            database_name: createDatabaseName
        })
        .then(response => {
            if (response.data.message === "Database created") {
                setCreateDatabaseName("");
                document.getElementById('my_modal_5').close();
                refreshDatabases();
            } else {
                showError(response.data.message);
            }
        })
        .catch(error => {
            showError("Unknown error creating database.");
        });
    };

    // Add functions to handle running and saving queries
    const runQuery = () => {
        setQueryResultVisible(false);
        setQueryErrorVisible(false);
        makePostRequest("/run_query", {
            connection_id: connectionID,
            query: editorValue,
            database: selectedDatabaseName
        })
        .then(response => {
            if (response.data.results) {
                if (response.data.results.length === 1 && response.data.results[0].length === 0) {
                    setQueryResult("Success, Result is empty.");
                } else {
                    setQueryResult(response.data.results);
                }
                setQueryError("");
                setQueryErrorVisible(false);
                setQueryResultVisible(true);
                setTimeout(() => {
                    setQueryResultVisible(false);
                    setQueryResult([]);
                }, 10000);
            } else {
                setQueryError(response.data.error);
                setQueryErrorVisible(true);
                setQueryResult([]);
                setQueryResultVisible(false);
                setTimeout(() => {
                    setQueryError("");
                    setQueryErrorVisible(false);
                }, 5000);
            }
        })
        .catch(error => {
            setQueryError(error.response?.data?.error || "An unknown error occurred");
            setQueryErrorVisible(true);
            setQueryResult([]);
            setQueryResultVisible(false);
            setTimeout(() => {
                setQueryError("");
                setQueryErrorVisible(false);
            }, 5000);
        });
    };

    return (
        <>
            <div className="flex space-x-12">
                <Navbar />
                <div className='pt-10 pr-10 w-full'>
                    <div className='breadcrumbs'>
                        <ul>
                            <li><Link to="/dashboard">Home</Link></li>
                            <li>{connectionName}</li>
                        </ul>
                    </div>
                    <h1 className="text-5xl font-bold">{connectionName} Databases</h1>
                    <div className="divider"></div>
                    <div className="flex space-x-4 mb-4">
                        <button 
                            className={`btn flex-1 ${activeAccordion === 'database' ? 'btn-active' : ''}`}
                            onClick={() => setActiveAccordion('database')}
                        >
                            Database View
                        </button>
                        <button 
                            className={`btn flex-1 ${activeAccordion === 'sql' ? 'btn-active' : ''}`}
                            onClick={() => setActiveAccordion('sql')}
                        >
                            SQL Editor
                        </button>
                    </div>
                    <div className="bg-base-200 p-4 rounded-lg">
                        {activeAccordion === 'database' && (
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <div className="flex justify-center pt-20">
                                        <span className="loading loading-infinity loading-lg"></span>
                                    </div>
                                ) : (
                                    <>
                                        <table className="table w-full">
                                            <thead>
                                                <tr>
                                                    <th className="text-xl w-1/12">ID</th>
                                                    <th className="text-xl">Database Name</th>
                                                    <th className="text-xl w-1/12">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {databases.map((database, index) => (
                                                    <tr key={index}>
                                                        <td className='text-base w-1/12'>{index}</td>
                                                        <td className='text-base'>
                                                            <button className="btn btn-ghost w-full justify-start text-left" onClick={() => {
                                                                navigate("/tables", { state: { connection_id: connectionID, connection_name: connectionName, database_name: database.name } });
                                                            }}>{database.name}</button>
                                                        </td>
                                                        <td className='text-base w-1/12'>
                                                            <div className="flex space-x-2">
                                                                <button className="btn btn-neutral" onClick={() => {
                                                                    setSelectedDatabaseName(database.name);
                                                                    setSelectedNewDatabaseName(database.name);
                                                                    document.getElementById('my_modal_3').showModal();
                                                                }}><FaEdit/></button>
                                                                <button className="btn btn-neutral" onClick={() => {
                                                                    setSelectedDatabaseName(database.name);
                                                                    document.getElementById('my_modal_4').showModal();
                                                                }}><FaTrash/></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <button className="btn btn-neutral w-full mt-4" onClick={() => document.getElementById('my_modal_5').showModal()}>Create new Database</button>
                                        <div className="flex justify-center items-center join pt-5">
                                            {currentPage === 1 ? (
                                                <button className="join-item btn" disabled>«</button>
                                            ) : (
                                                <button className="join-item btn" onClick={() => setCurrentPage(currentPage - 1)}>«</button>
                                            )}
                                            <button className="join-item btn">Page {currentPage}</button>
                                            {currentPage < maxPage ? (
                                                <button className="join-item btn" onClick={() => setCurrentPage(currentPage + 1)}>»</button>
                                            ) : (
                                                <button className="join-item btn" disabled>»</button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {activeAccordion === 'sql' && (
                            <>
                                <div>
                                    <select 
                                        className="select select-bordered w-full" 
                                        onChange={(e) => {setSelectedDatabaseName(e.target.value);}}
                                    >
                                        <option value="none">None</option>
                                        {allDatabases.map((database, index) => (
                                            <option key={index} value={database.name}>{database.name}</option>
                                        ))}
                                    </select>
                                    <CodeMirror
                                        value={editorValue}
                                        height="200px"
                                        theme={vscodeDark}
                                        extensions={[sql()]}
                                        onChange={(value) => setEditorValue(value)}
                                    />
                                    <button className="btn btn-success mt-4 w-full" onClick={runQuery}>
                                        Run Query
                                    </button>
                                </div>
                                {queryResultVisible && (
                                    <div className="mt-4 p-4 bg-base-300 rounded-lg overflow-x-auto">
                                        {JSON.stringify(queryResult)}
                                    </div>
                                )}
                                {queryErrorVisible && (
                                    <div className="mt-4 p-4 bg-error text-error-content rounded-lg">
                                        Error: {queryError}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <dialog id="my_modal_3" className="modal">
                        <div className="modal-box">
                            <form method="dialog">
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                            </form>
                            <h3 className="font-bold text-lg">Edit {selectedDatabaseName}</h3>
                            <div className="py-4">
                                <div className='space-y-2'>
                                    {errorVisible &&
                                        <div className='pb-5'>
                                            <div role="alert" className="alert alert-error">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6 shrink-0 stroke-current"
                                                    fill="none"
                                                    viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{error}</span>
                                            </div>
                                        </div>
                                    }
                                    <label className="input input-bordered flex items-center gap-2">
                                        Database Name
                                        <input type="text" className="grow" value={selectedNewDatabaseName} onChange={(e) => setSelectedNewDatabaseName(e.target.value)} required />
                                    </label>
                                    <button className="btn btn-neutral w-full" onClick={saveEditDatabase}>Save</button>
                                </div>
                            </div>
                        </div>
                    </dialog>

                    <dialog id="my_modal_4" className="modal">
                        <div className="modal-box">
                            <form method="dialog">
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                            </form>
                            <h3 className="font-bold text-lg">Delete {selectedDatabaseName}</h3>
                            <div className="py-4">
                                <div className='space-y-2'>
                                    <label className="input flex items-center gap-2">
                                        Are you sure you want to delete {selectedDatabaseName}? This action cannot be undone.
                                    </label>
                                    <button className="btn btn-neutral w-full" onClick={deleteDatabase}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </dialog>

                    <dialog id="my_modal_5" className="modal">
                        <div className="modal-box">
                            <form method="dialog">
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                            </form>
                            <h3 className="font-bold text-lg">Create Database</h3>
                            <div className="py-4">
                                <div className='space-y-2'>
                                    {errorVisible &&
                                        <div className='pb-5'>
                                            <div role="alert" className="alert alert-error">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6 shrink-0 stroke-current"
                                                    fill="none"
                                                    viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{error}</span>
                                            </div>
                                        </div>
                                    }
                                    <label className="input input-bordered flex items-center gap-2">
                                        Database Name
                                        <input type="text" className="grow" onChange={(e) => setCreateDatabaseName(e.target.value)} required />
                                    </label>
                                    <button className="btn btn-neutral w-full" onClick={createDatabase}>Create</button>
                                </div>
                            </div>
                        </div>
                    </dialog>
                </div>
            </div>
        </>
    );
};

export default Databases;