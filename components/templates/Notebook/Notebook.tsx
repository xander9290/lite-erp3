"use client";

import React, { ReactElement, ReactNode } from "react";
import { Tab, Nav } from "react-bootstrap";
import { PageProps } from "./Page";

interface NotebookProps {
  children: ReactNode;
  defaultActiveKey?: string;
}

export function Notebook({ children, defaultActiveKey }: NotebookProps) {
  const pages = React.Children.toArray(children) as ReactElement<PageProps>[];

  const visiblePages = pages.filter((p) => !p.props.invisible);

  const activeKey = defaultActiveKey || visiblePages[0]?.props.eventKey;

  return (
    <Tab.Container defaultActiveKey={activeKey}>
      <Nav variant="tabs">
        {visiblePages.map((page) => (
          <Nav.Item key={page.props.eventKey}>
            <Nav.Link eventKey={page.props.eventKey}>
              {page.props.title}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <Tab.Content>
        {visiblePages.map((page) => (
          <Tab.Pane
            key={page.props.eventKey}
            eventKey={page.props.eventKey}
            mountOnEnter
            unmountOnExit
          >
            {page.props.children}
          </Tab.Pane>
        ))}
      </Tab.Content>
    </Tab.Container>
  );
}
