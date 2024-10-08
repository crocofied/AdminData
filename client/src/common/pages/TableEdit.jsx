import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from '../components/Navbar';
import { FaTrash  } from 'react-icons/fa';
import { makePostRequest } from '../utils/api';
import { useTranslation } from 'react-i18next';
const TableEdit = () => {
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
    const [tableName, setTableName] = useState("");
    const [newTableName, setNewTableName] = useState("");
    const [columns, setColumns] = useState([]);
    const [error, setError] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);
    const [edited, setEdited] = useState(false);
    // Loading state
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        setConnectionID(location.state.connection_id);
        setConnectionName(location.state.connection_name);
        setDatabaseName(location.state.database_name);
        setTableName(location.state.table_name);
        setNewTableName(location.state.table_name);
    }, [location.state]);

    useEffect(() => {
        if (connectionID && databaseName && tableName) {
            makePostRequest("/get_table_data", {
                connection_id: connectionID,
                database_name: databaseName,
                table_name: tableName
            })
            .then(response => {
                setColumns(response.data.columns);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
            });
        }
    }, [connectionID, databaseName, tableName]);

    const handleColumnChange = (index, key, value) => {
        const newColumns = [...columns];
        newColumns[index][key] = value;
        setColumns(newColumns);
    };

    const editTable = () => {
        if(edited){
            return;
        }
        setEdited(true);
        makePostRequest("/edit_table", {
            connection_id: connectionID,
            database_name: databaseName,
            table_name: tableName,
            new_table_name: newTableName,
            columns: columns
        })
        .then(response => {
            navigate("/tables", {
                state: {
                    connection_id: connectionID,
                    connection_name: connectionName,
                    database_name: databaseName
                }
            });
        })
        .catch(error => {
            setError(error.response.data.message);
            setErrorVisible(true);
        });
    }

    const addColumn = () => {
        const newColumns = [...columns];
        newColumns.push({
            name: "",
            type: "",
            length: "",
            default: "",
            index: false,
            autoIncrement: false
        });
        setColumns(newColumns);
    }

    const removeColumn = (index) => {
        const newColumns = [...columns];
        newColumns.splice(index, 1);
        setColumns(newColumns);
    }

    return (
        <>
            <div className="flex space-x-12">
                <Navbar />
                <div className='pt-10 pr-10 w-full'>
                    <div className="breadcrumbs text-sm">
                        <ul>
                            <li><Link to="/dashboard">{t("table_edit.home")}</Link></li>
                            <li><Link to="/databases" state={{
                                connection_id: connectionID,
                                connection_name: connectionName
                            }}>{connectionName}</Link></li>
                            <li><Link to="/tables" state={{
                                connection_id: connectionID,
                                connection_name: connectionName,
                                database_name: databaseName
                            }}>{databaseName}</Link></li>
                            <li>{t("table_edit.edit_table")}</li>
                        </ul>
                    </div>
                    <h1 className="text-5xl font-bold text-primary">{t("table_edit.edit_table")}</h1>
                    <div className="divider"></div>
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <div className="flex justify-center pt-20">
                                <span className="loading loading-infinity loading-lg"></span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
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
                            <input type="text" className="input input-bordered w-full" placeholder={t("table_edit.table_name_placeholder")} value={newTableName} onChange={(e) => setNewTableName(e.target.value)} required />
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th className="text-xl w-3/12">{t("table_edit.name")}</th>
                                        <th className="text-xl w-2/12">{t("table_edit.type")}</th>
                                        <th className="text-xl w-2/12">{t("table_edit.length")}</th>
                                        <th className="text-xl w-2/12">{t("table_edit.default")}</th>
                                        <th className="text-xl w-1/12">{t("table_edit.index")}</th>
                                        <th className="text-xl w-1/12">{t("table_edit.auto_increment")}</th>
                                        <th className="text-xl w-1/12">{t("table_edit.action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {columns.map((column, index) => (
                                        <tr key={index}>
                                            <td><input type="text" className="input input-bordered w-full" placeholder="e.g. id" value={column.name} onChange={(e) => handleColumnChange(index, 'name', e.target.value)} /></td>
                                            <td>
                                                <select className="select select-bordered w-full" value={column.type} onChange={(e) => handleColumnChange(index, 'type', e.target.value)}>
                                                    <option disabled selected value="">{t("table_edit.select")}</option>
                                                    <option value="tinyint">TINYINT</option>
                                                    <option value="smallint">SMALLINT</option>
                                                    <option value="mediumint">MEDIUMINT</option>
                                                    <option value="int(11)">INT</option>
                                                    <option value="bigint">BIGINT</option>
                                                    <option value="decimal">DECIMAL</option>
                                                    <option value="float">FLOAT</option>
                                                    <option value="double">DOUBLE</option>
                                                    <option value="real">REAL</option>
                                                    <option value="bit">BIT</option>
                                                    <option value="boolean">BOOLEAN</option>
                                                    <option value="serial">SERIAL</option>
                                                    <option value="char">CHAR</option>
                                                    <option value="varchar">VARCHAR</option>
                                                    <option value="tinytext">TINYTEXT</option>
                                                    <option value="text">TEXT</option>
                                                    <option value="mediumtext">MEDIUMTEXT</option>
                                                    <option value="longtext">LONGTEXT</option>
                                                    <option value="binary">BINARY</option>
                                                    <option value="varbinary">VARBINARY</option>
                                                    <option value="tinyblob">TINYBLOB</option>
                                                    <option value="blob">BLOB</option>
                                                    <option value="mediumblob">MEDIUMBLOB</option>
                                                    <option value="longblob">LONGBLOB</option>
                                                    <option value="enum">ENUM</option>
                                                    <option value="set">SET</option>
                                                    <option value="date">DATE</option>
                                                    <option value="datetime">DATETIME</option>
                                                    <option value="timestamp">TIMESTAMP</option>
                                                    <option value="time">TIME</option>
                                                    <option value="year">YEAR</option>
                                                    <option value="json">JSON</option>
                                                    <option value="geometry">GEOMETRY</option>
                                                    <option value="point">POINT</option>
                                                    <option value="linestring">LINESTRING</option>
                                                    <option value="polygon">POLYGON</option>
                                                    <option value="multipoint">MULTIPOINT</option>
                                                    <option value="multilinestring">MULTILINESTRING</option>
                                                    <option value="multipolygon">MULTIPOLYGON</option>
                                                    <option value="geometrycollection">GEOMETRYCOLLECTION</option>
                                                    <option value="uuid">UUID</option>

                                                </select>
                                            </td>
                                            <td><input type="text" className="input input-bordered w-full" placeholder="255" value={column.length} onChange={(e) => handleColumnChange(index, 'length', e.target.value)} /></td>
                                            <td><input type="text" className="input input-bordered w-full" placeholder="Default" value={column.default} onChange={(e) => handleColumnChange(index, 'default', e.target.value)} /></td>
                                            <td><input type="checkbox" className="checkbox" checked={column.index} onChange={(e) => handleColumnChange(index, 'index', e.target.checked)} /></td>
                                            <td><input type="checkbox" className="checkbox" checked={column.autoIncrement} onChange={(e) => handleColumnChange(index, 'autoIncrement', e.target.checked)} /></td>
                                            <td><button className="btn btn-neutral" onClick={() => removeColumn(index)}><FaTrash /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className='pt-10'>
                                <button className="btn btn-neutral w-full" onClick={addColumn}>{t("table_edit.add_column")}</button>
                                <button className="btn btn-primary w-full mt-5" onClick={editTable}>{t("table_edit.edit_table")}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default TableEdit;