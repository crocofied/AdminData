import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useLocation, Link } from "react-router-dom";
import SessionChecker from '../components/SessionChecker';
import Navbar from '../components/Navbar';

const TableCreate = () => {
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
        if (!SessionChecker()) {
            navigate("/");
        }
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

    const createTable = () => {
        axios.post(`${import.meta.env.VITE_API_URL}/create_table`, {
            session_id: Cookies.get("session_id"),
            connection_id: connectionID,
            database: databaseName,
            table: tableName,
            columns: columns
        })
        .then(response => {
            console.log(response.data);
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
                            <li><Link to="/dashboard">Home</Link></li>
                            <li><Link to="/databases" state={{
                                connection_id: connectionID,
                                connection_name: connectionName
                            }}>{connectionName}</Link></li>
                            <li><Link to="/tables" state={{
                                connection_id: connectionID,
                                connection_name: connectionName,
                                database_name: databaseName
                            }}>{databaseName}</Link></li>
                            <li>Create Table</li>
                        </ul>
                    </div>
                    <h1 className="text-5xl font-bold">Create Table</h1>
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
                        <input type="text" className="input input-bordered w-full" placeholder="Table Name" onChange={(e) => setTableName(e.target.value)} required />
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th className="text-xl w-3/12">Name</th>
                                    <th className="text-xl w-2/12">Type</th>
                                    <th className="text-xl w-3/12">Length</th>
                                    <th className="text-xl w-2/12">Default</th>
                                    <th className="text-xl w-1/12">Index</th>
                                    <th className="text-xl w-1/12">Auto Increment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {columns.map((column, index) => (
                                    <tr key={index}>
                                        <td><input type="text" className="input input-bordered w-full" placeholder="e.g. id" value={column.name} onChange={(e) => handleColumnChange(index, 'name', e.target.value)} /></td>
                                        <td>
                                            <select className="select select-bordered w-full" value={column.type} onChange={(e) => handleColumnChange(index, 'type', e.target.value)}>
                                                <option disabled selected>Select</option>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className='pt-10'>
                            <button className="btn btn-neutral w-full" onClick={addColumn}>Add Column</button>
                            <button className="btn btn-primary w-full mt-5" onClick={createTable}>Create Table</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TableCreate;