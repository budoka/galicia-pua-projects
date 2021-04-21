import React from "react"

type BadgeProps = {
    amount : number,
}


export const Badge = (props: BadgeProps) => {


    return <>
    {
    props.amount === 0 ?
    <span className="badge badge-light badge-pill float-right" style={{font:"size:0.9em"}}>{props.amount}</span>
    : props.amount < 10 ?
    <span className="badge badge-primary badge-pill float-right" style={{font:"size:0.9em"}}>{props.amount}</span>
    : props.amount < 20 ?
    <span className="badge badge-warning badge-pill float-right" style={{font:"size:0.9em"}}>{props.amount}</span>
    :
    <span className="badge badge-danger badge-pill float-right" style={{font:"size:0.9em"}}>{props.amount}</span>
    
    }
    </>
}