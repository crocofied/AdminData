import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import { FaEdit, FaTrash  } from 'react-icons/fa';
import { makePostRequest } from '../utils/api';
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { sql } from "@codemirror/lang-sql";
import { useTranslation } from 'react-i18next';

const Tables = () => {
    const { t, i18n: {changeLanguage, language}} = useTranslation();
    useEffect(() => {
        changeLanguage(Cookies.get("language"));
    }, []);
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
    const [editorValue, setEditorValue] = useState("");
    const [queryResult, setQueryResult] = useState("");
    const [queryError, setQueryError] = useState("");
    const [queryResultVisible, setQueryResultVisible] = useState(false);
    const [queryErrorVisible, setQueryErrorVisible] = useState(false);
    // New state for active accordion
    const [activeAccordion, setActiveAccordion] = useState('tables');

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
        setLoading(true);
        makePostRequest("/get_tables?page=" + currentPage + "&size=6", {
            connection_id: connectionID,
            database: databaseName
        })
        .then(response => {
            if (response.data.items.length === 0 && response.status === 200) {
                setCurrentPage(0);
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
        makePostRequest("/delete_table", {
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

    const runQuery = () => {
        setQueryResultVisible(false);
        setQueryErrorVisible(false);
        if (editorValue === "") {
            setQueryError(t("databases.error_query_empty"));
            setQueryErrorVisible(true);
            setTimeout(() => {
                setQueryError("");
                setQueryErrorVisible(false);
            }, 5000);
            return;
        }
        makePostRequest("/run_query", {
            connection_id: connectionID,
            database: databaseName,
            query: editorValue
        })
        .then(response => {
            if (response.data.results) {
                if (response.data.results.length === 1 && response.data.results[0].length === 0) {
                    setQueryResult(t("databases.success_query_empty"));
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
            }
        })
        .catch(error => {
            setQueryError(error.response?.data?.error || t("databases.error_unknown"));
            setQueryErrorVisible(true);
            setQueryResult([]);
            setQueryResultVisible(false);
            setTimeout(() => {
                setQueryError("");
                setQueryErrorVisible(false);
            }, 5000);
        });
    }

    return (
        <>
         <div className="flex space-x-12">
            <Navbar />
            <div className='pt-10 pr-10 w-full'>
            <div className="breadcrumbs text-sm">
                <ul>
                    <li><Link to="/dashboard">{t("databases.home")}</Link></li>
                    <li><Link to="/databases" state={{
                        connection_id: connectionID,
                        connection_name: connectionName
                    }}>{connectionName}</Link></li>
                    <li>{databaseName}</li>
                </ul>
                </div>
                <h1 className="text-5xl font-bold">{databaseName} {t("tables.tables")}</h1>
                <div className="divider"></div>
                <div className="flex space-x-4 mb-4">
                    <button 
                        className={`btn flex-1 ${activeAccordion === 'tables' ? 'btn-active' : ''}`}
                        onClick={() => setActiveAccordion('tables')}
                    >
                        {t("tables.tables")}
                    </button>
                    <button 
                        className={`btn flex-1 ${activeAccordion === 'sql' ? 'btn-active' : ''}`}
                        onClick={() => setActiveAccordion('sql')}
                    >
                        {t("databases.sql_editor")}
                    </button>
                </div>
                <div className="bg-base-200 p-4 rounded-lg">
                    {activeAccordion === 'tables' ? (
                        <div className="overflow-x-auto">
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
                                            <th className="text-xl">{t("tables.table_name")}</th>
                                            <th className="text-xl w-1/12">{t("tables.rows")}</th>
                                            <th className="text-xl w-2/12">{t("tables.size")}</th>
                                            <th className="text-xl w-1/12">{t("tables.actions")}</th>
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
                                                <td className='text-base w-1/12'>
                                                    <div className="space-x-3">
                                                        <Link to="/table_edit" state={{
                                                            connection_id: connectionID,
                                                            connection_name: connectionName,
                                                            database_name: databaseName,
                                                            table_name: table.name
                                                        }} className="btn btn-neutral"><FaEdit/></Link>
                                                        <button className="btn btn-neutral" onClick={() => {
                                                            setSelectedTableName(table.name);
                                                            document.getElementById('my_modal_4').showModal();
                                                        }}><FaTrash/></button>
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
                                }}>{t("tables.create_new_table")}</button>
                                <div className="flex justify-center items-center join pt-5">
                                    {currentPage === 1 ? (
                                        <button className="join-item btn" disabled>«</button>
                                    ) : (
                                        <button className="join-item btn" onClick={() => setCurrentPage(currentPage-1)}>«</button>
                                    )}
                                    <button className="join-item btn">{t("tables.page")} {currentPage}</button>
                                    {currentPage < maxPage ? (
                                        <button className="join-item btn" onClick={() => setCurrentPage(currentPage + 1)}>»</button>
                                    ) : (
                                        <button className="join-item btn" disabled>»</button>
                                    )}
                                </div>
                            </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div>
                                <div className="mt-4 border border-gray-700 rounded-3xl overflow-hidden shadow-lg">
                                    <CodeMirror
                                        value={editorValue}
                                        height="300px"
                                        theme={vscodeDark}
                                        extensions={[sql()]}
                                        onChange={(value) => setEditorValue(value)}
                                        className="w-full font-mono text-sm"
                                    />
                                </div>
                                <button className="btn btn-success mt-4 w-full" onClick={runQuery}>
                                    {t("databases.run_query")}
                                </button>
                            </div>
                            {queryResultVisible && (
                                <div className="mt-4 p-4 bg-base-300 rounded-lg overflow-x-auto">
                                    {JSON.stringify(queryResult)}
                                </div>
                            )}
                            {queryErrorVisible && (
                                <div className="mt-4 p-4 bg-error text-error-content rounded-lg">
                                    {t("databases.error")}: {queryError}
                                </div>
                            )}
                        </>
                    )}
                </div>
                <dialog id="my_modal_4" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">{t("tables.delete_table", { tableName: selectedTableName })}</h3>
                        <div className="py-4">
                            <div className='space-y-2'>
                                <label className="input flex items-center gap-2">
                                    {t("tables.delete_table_description", { tableName: selectedTableName })}
                                </label>
                                <button className="btn btn-neutral w-full" onClick={deleteTable}>{t("tables.delete")}</button>
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