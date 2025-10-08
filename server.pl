#!/usr/bin/env swipl

:- use_module(library(main)).
:- use_module(library(http/websocket)).
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/json)).

:- http_handler(root(ws),
                http_upgrade_to_websocket(listen, []),
                [spawn([])]).

:- initialization(main, main).

listen(WebSocket) :-
    ws_receive(WebSocket, Message),
    (   Message.opcode == close
    ->  true
    ;   process_message(Message.data, Response),
        ws_send(WebSocket, json(Response)),

        listen(WebSocket)
    ).

main(_) :-
    http_server(http_dispatch, [port(4000)]),

    thread_get_message(quit). % hang

process_message(JSON, Response) :-
    atom_json_dict(JSON, Data, []),
    Response = Data.
