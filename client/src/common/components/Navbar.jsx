import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {  FaHome, FaSyncAlt} from 'react-icons/fa';
import { IoSettingsSharp} from 'react-icons/io5';
import { MdOutlineLogout} from 'react-icons/md';
import { makePostRequest } from '../utils/api';


function Navbar() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateVersion, setUpdateVersion] = useState("");
    useEffect(() => {
        makePostRequest("/update_check")
            .then(response => {
                if (response.data.message === "Update available") {
                    setUpdateAvailable(true);
                    setUpdateVersion(response.data.latest);
                }
            });
    }, []);
    return (
    <>
        <div className="navbar bg-base-200 shadow-xl w-24 h-screen border-r border-gray-800">
                <div className="container mx-auto flex flex-col justify-between h-full pt-3">
                    <div className="flex-none">
                        <ul className="menu menu-vertical px-1">
                            <li>
                                <Link to="/dashboard" className="bg-base-300 text-white p-2 rounded-2xl mb-4 flex items-center justify-center w-16 h-16">
                                    <FaHome className="w-10 h-10" />
                                </Link>
                                <Link to="/settings" className="bg-base-300 text-white p-2 rounded-2xl mb-4 flex items-center justify-center w-16 h-16">
                                    <IoSettingsSharp className="w-10 h-10" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-none">
                        <ul className="menu menu-vertical px-1">
                            {updateAvailable && (
                                <li>
                                    <button onClick={() => document.getElementById('update_modal').showModal()} className="bg-base-300 text-white p-2 rounded-2xl mb-4 flex items-center justify-center w-16 h-16">
                                        <FaSyncAlt className="w-10 h-10" />
                                    </button>
                                </li>
                            )}
                            <li>
                                <Link to="/logout" className="bg-base-300 text-white p-2 rounded-2xl mb-4 flex items-center justify-center w-16 h-16">
                                    <MdOutlineLogout className="w-10 h-10" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
        </div>

        <dialog id="update_modal" className="modal">
            <form method="dialog" className="modal-box">
                <h3 className="font-bold text-lg">Update Available</h3>
                <p className="py-4">A new version ({updateVersion}) is available. If you want to update, please follow the <a href="https://www.admindata.xyz/update.html" className="link" target="_blank">Update Instructions</a>.</p>
                <div className="modal-action">
                    <button className="btn" onClick={() => document.getElementById('update_modal').close()}>Close</button>
                </div>
            </form>
        </dialog>
    </>
    );
}

export default Navbar;