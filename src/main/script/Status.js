const Status = {
    CLOSED_PERM: {
        value: 'CLOSED_PERM',
        displayName: "Closed Permanently",
        className: "label label-danger"
    },
    CLOSED_TEMP: {
        value: 'CLOSED_TEMP',
        displayName: "Closed Temporarily",
        className: "label label-default"
    },
    PERMIT: {
        value: 'PERMIT',
        displayName: "Permit",
        className: "label label-info"
    },
    CONSTRUCTION: {
        value: 'CONSTRUCTION',
        displayName: "Construction",
        className: "label label-warning"
    },
    OPEN: {
        value: 'OPEN',
        displayName: "Open",
        className: "label label-success"
	},
    VOTING: {
        value: 'VOTING',
        displayName: "Voting",
        className: "label label-plan"
    },
    PLAN: {
        value: 'PLAN',
        displayName: "Plan",
        className: "label label-plan"
    },
    EXPANDING: {
        value: 'EXPANDING',
        displayName: "Expanding",
        className: "label label-success"
    }
};

export default Status;
