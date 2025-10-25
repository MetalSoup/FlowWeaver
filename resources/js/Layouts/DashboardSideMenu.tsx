import {User} from "@/types";
import {Link} from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";


export default function DashboardSideMenu(props: {
    user: User | undefined,
    name: string,
    onClick: () => void,
    showingNavigationDropdown: boolean
}) {
    return <aside className="relative bg-sidebar h-screen  hidden sm:block shadow-xl dark:bg-gray-500 ">

        <nav className="text-white text-base font-semibold pt-3">

            <Link href={route("dashboard")}
                  className="flex items-center active-nav-link text-white py-4 pl-6 nav-item">

                Dashboard
            </Link>
            <Link href={route("instances.index")}
                  className="flex items-center text-white opacity-75 hover:opacity-100 py-4 pl-6 nav-item">

                Instances
            </Link>
            <Link href={route("pages.index")}
                  className="flex items-center text-white opacity-75 hover:opacity-100 py-4 pl-6 nav-item">

                Pages
            </Link>
            <Link href={route("flows.index")}
                  className="flex items-center text-white opacity-75 hover:opacity-100 py-4 pl-6 nav-item">

                Flows
            </Link>
            <Link href={route("fields.index")}
                  className="flex items-center text-white opacity-75 hover:opacity-100 py-4 pl-6 nav-item">

                Fields
            </Link>


            <div className="hidden sm:flex sm:items-center sm:ms-6">
                <div className="ms-3 relative">
                    <Dropdown>
                        <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {props.user ? props.name : ""}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route("profile.edit")}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route("logout")} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>

            <div className="-me-2 flex items-center sm:hidden">
                <button
                    onClick={props.onClick}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                >
                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path
                            className={!props.showingNavigationDropdown ? "inline-flex" : "hidden"}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                        <path
                            className={props.showingNavigationDropdown ? "inline-flex" : "hidden"}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>


        </nav>

    </aside>;
}
