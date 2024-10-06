import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from '../components/Navbar';
import { FaTrash  } from 'react-icons/fa';
import { makePostRequest } from '../utils/api';
import { useTranslation } from 'react-i18next';

const TableCreate = () => {
    const { t, i18n: {changeLanguage, language}} = useTranslation();
    useEffect(() => {
        changeLanguage(import.meta.env.VITE_LANGUAGE);
    }, []);
    // Navigation and location details
    const navigate = useNavigate();
    const location = useLocation();

    // Connection details
    const [connectionID, setConnectionID] = useState();
    const [connectionName, setConnectionName] = useState("");
    const [databaseName, setDatabaseName] = useState("");
    const [tableName, setTableName] = useState("");
    const [columns, setColumns] = useState([]);
    const [error, setError] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);

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
    }, [location.state.connection_id]);

    const handleColumnChange = (index, field, value) => {
        const newColumns = [...columns];
        newColumns[index] = { ...newColumns[index], [field]: value };
        setColumns(newColumns);
    };

    const addColumn = () => {
        setColumns([...columns, { name: '', type: '', length: '', default: '', index: false, autoIncrement: false }]);
    };
    const removeColumn = (index) => {
        const newColumns = [...columns];
        newColumns.splice(index, 1);
        setColumns(newColumns);
    };

    const createTable = () => {
        makePostRequest("/create_table", {
            connection_id: connectionID,
            database: databaseName,
            table: tableName,
            columns: columns
        })
        .then(response => {
            if (response.data.message === "Table created") {
                navigate("/tables", {
                    state: {
                        connection_id: connectionID,
                        connection_name: connectionName,
                        database_name: databaseName
                    }
                });
            }
        })
        .catch(error => {
            console.log(error);
            setError(error.response.data.detail);
            setErrorVisible(true);
            setTimeout(() => {
                setErrorVisible(false);
                setError("");
            }, 5000);
        });
    };

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
                            <li><Link to="/tables" state={{
                                connection_id: connectionID,
                                connection_name: connectionName,
                                database_name: databaseName
                            }}>{databaseName}</Link></li>
                            <li>{t("table_create.create_table")}</li>
                        </ul>
                    </div>
                    <h1 className="text-5xl font-bold">{t("table_create.create_table")}</h1>
                    <div className="divider"></div>
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
                        <input type="text" className="input input-bordered w-full" placeholder={t("table_create.table_name_placeholder")} onChange={(e) => setTableName(e.target.value)} required />
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th className="text-xl w-3/12">{t("table_create.name")}</th>
                                    <th className="text-xl w-2/12">{t("table_create.type")}</th>
                                    <th className="text-xl w-2/12">{t("table_create.length")}</th>
                                    <th className="text-xl w-2/12">{t("table_create.default")}</th>
                                    <th className="text-xl w-1/12">{t("table_create.index")}</th>
                                    <th className="text-xl w-1/12">{t("table_create.auto_increment")}</th>
                                    <th className="text-xl w-1/12">{t("table_create.action")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {columns.map((column, index) => (
                                    <tr key={index}>
                                        <td><input type="text" className="input input-bordered w-full" placeholder="e.g. id" value={column.name} onChange={(e) => handleColumnChange(index, 'name', e.target.value)} /></td>
                                        <td>
                                            <select className="select select-bordered w-full" value={column.type} onChange={(e) => handleColumnChange(index, 'type', e.target.value)}>
                                                <option disabled selected value="">{t("table_create.select")}</option>
                                                <option>TINYINT</option>
                                                <option>SMALLINT</option>
                                                <option>MEDIUMINT</option>
                                                <option>INT</option>
                                                <option>BIGINT</option>
                                                <option>DECIMAL</option>
                                                <option>FLOAT</option>
                                                <option>DOUBLE</option>
                                                <option>REAL</option>
                                                <option>BIT</option>
                                                <option>BOOLEAN</option>
                                                <option>SERIAL</option>
                                                <option>CHAR</option>
                                                <option>VARCHAR</option>
                                                <option>TINYTEXT</option>
                                                <option>TEXT</option>
                                                <option>MEDIUMTEXT</option>
                                                <option>LONGTEXT</option>
                                                <option>BINARY</option>
                                                <option>VARBINARY</option>
                                                <option>TINYBLOB</option>
                                                <option>BLOB</option>
                                                <option>MEDIUMBLOB</option>
                                                <option>LONGBLOB</option>
                                                <option>ENUM</option>
                                                <option>SET</option>
                                                <option>DATE</option>
                                                <option>DATETIME</option>
                                                <option>TIMESTAMP</option>
                                                <option>TIME</option>
                                                <option>YEAR</option>
                                                <option>JSON</option>
                                                <option>GEOMETRY</option>
                                                <option>POINT</option>
                                                <option>LINESTRING</option>
                                                <option>POLYGON</option>
                                                <option>MULTIPOINT</option>
                                                <option>MULTILINESTRING</option>
                                                <option>MULTIPOLYGON</option>
                                                <option>GEOMETRYCOLLECTION</option>
                                                <option>UUID</option>
                                            </select>
                                        </td>
                                        <td><input type="text" className="input input-bordered w-full" placeholder="255" value={column.length} onChange={(e) => handleColumnChange(index, 'length', e.target.value)} /></td>
                                        <td><input type="text" className="input input-bordered w-full" placeholder="Default" value={column.default} onChange={(e) => handleColumnChange(index, 'default', e.target.value)} /></td>
                                        <td><input type="checkbox" className="checkbox" checked={column.index} onChange={(e) => handleColumnChange(index, 'index', e.target.checked)} /></td>
                                        <td><input type="checkbox" className="checkbox" checked={column.autoIncrement} onChange={(e) => handleColumnChange(index, 'autoIncrement', e.target.checked)} /></td>
                                        <td><button className="btn btn-error" onClick={() => removeColumn(index)}><FaTrash /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className='pt-10'>
                            <button className="btn btn-neutral w-full" onClick={addColumn}>{t("table_create.add_column")}</button>
                            <button className="btn btn-primary w-full mt-5" onClick={createTable}>{t("table_create.create")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TableCreate;